import { db } from "../db/client.js";
import { tests, questions, examSessions, users } from "../schema/schema.js";
import { eq, and, desc, asc } from "drizzle-orm";

// Get all published tests (for students)
export const getPublishedTests = async (req, res) => {
  try {
    const publishedTests = await db
      .select({
        id: tests.id,
        name: tests.name,
        subject: tests.subject,
        duration: tests.duration,
        total_marks: tests.total_marks,
        num_questions: tests.num_questions,
        description: tests.description,
        created_at: tests.created_at,
      })
      .from(tests)
      .where(eq(tests.status, "published"))
      .orderBy(desc(tests.created_at));

    res.status(200).json({
      success: true,
      data: publishedTests,
    });
  } catch (error) {
    console.error("Error fetching published tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch published tests",
      error: error.message,
    });
  }
};

// Get my attempted tests (student's exam history)
export const getMyAttempts = async (req, res) => {
  try {
    const studentId = req.user.id;

    const attempts = await db
      .select({
        session_id: examSessions.id,
        test_id: tests.id,
        test_name: tests.name,
        subject: tests.subject,
        duration: tests.duration,
        total_marks: tests.total_marks,
        score: examSessions.score,
        status: examSessions.status,
        start_time: examSessions.start_time,
        end_time: examSessions.end_time,
      })
      .from(examSessions)
      .innerJoin(tests, eq(examSessions.test_id, tests.id))
      .where(eq(examSessions.student_id, studentId))
      .orderBy(desc(examSessions.created_at));

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempts",
      error: error.message,
    });
  }
};

// Get test details with instructions (before starting test)
export const getTestInstructions = async (req, res) => {
  try {
    const { testId } = req.params;

    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (test.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This test is not available",
      });
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("Error fetching test instructions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test instructions",
      error: error.message,
    });
  }
};

// Start exam session
export const startExamSession = async (req, res) => {
  try {
    const { testId } = req.body;
    const studentId = req.user.id;

    // Validate test exists and is published
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (test.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This test is not available",
      });
    }

    // Check if there's an ongoing session
    const [existingSession] = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.test_id, parseInt(testId)),
          eq(examSessions.student_id, studentId),
          eq(examSessions.status, "in_progress")
        )
      );

    if (existingSession) {
      // Return existing session
      return res.status(200).json({
        success: true,
        message: "Resuming existing session",
        data: existingSession,
      });
    }

    // Create new exam session
    const [newSession] = await db
      .insert(examSessions)
      .values({
        test_id: parseInt(testId),
        student_id: studentId,
        answers: {},
        marked_for_review: [],
        status: "in_progress",
      })
      .returning();

    // Fetch questions for the test
    const testQuestions = await db
      .select({
        id: questions.id,
        question_text: questions.question_text,
        question_type: questions.question_type,
        options: questions.options,
        marks: questions.marks,
        negative_marks: questions.negative_marks,
        order: questions.order,
      })
      .from(questions)
      .where(eq(questions.test_id, parseInt(testId)))
      .orderBy(asc(questions.order));

    res.status(201).json({
      success: true,
      message: "Exam session started successfully",
      data: {
        session: newSession,
        test: test,
        questions: testQuestions,
      },
    });
  } catch (error) {
    console.error("Error starting exam session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start exam session",
      error: error.message,
    });
  }
};

// Save answer during exam
export const saveAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer, markedForReview } = req.body;
    const studentId = req.user.id;

    // Get exam session
    const [session] = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(sessionId)));

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exam session not found",
      });
    }

    // Verify session belongs to student
    if (session.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if session is still in progress
    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "This exam session has ended",
      });
    }

    // Update answers
    const currentAnswers = session.answers || {};
    currentAnswers[questionId] = answer;

    // Update marked for review
    let markedList = session.marked_for_review || [];
    if (markedForReview && !markedList.includes(questionId)) {
      markedList.push(questionId);
    } else if (!markedForReview && markedList.includes(questionId)) {
      markedList = markedList.filter((id) => id !== questionId);
    }

    // Save to database
    const [updatedSession] = await db
      .update(examSessions)
      .set({
        answers: currentAnswers,
        marked_for_review: markedList,
        updated_at: new Date(),
      })
      .where(eq(examSessions.id, parseInt(sessionId)))
      .returning();

    res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: updatedSession,
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save answer",
      error: error.message,
    });
  }
};

// Submit exam and auto-evaluate
export const submitExam = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;

    // Get exam session
    const [session] = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(sessionId)));

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exam session not found",
      });
    }

    // Verify session belongs to student
    if (session.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if already submitted
    if (session.status === "submitted" || session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This exam has already been submitted",
      });
    }

    // Get all questions for this test
    const testQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.test_id, session.test_id));

    // Auto-evaluate answers
    let totalScore = 0;
    const answers = session.answers || {};

    for (const question of testQuestions) {
      const studentAnswer = answers[question.id.toString()];
      
      if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== "") {
        const correctAnswers = question.correct_answers;
        
        if (question.question_type === "mcq" || question.question_type === "true_false") {
          // Single correct answer
          if (studentAnswer === correctAnswers[0]) {
            totalScore += question.marks;
          } else {
            totalScore -= question.negative_marks || 0;
          }
        } else if (question.question_type === "multiple_correct") {
          // Multiple correct answers
          const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
          const correctAnswerArray = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
          
          const isCorrect = 
            studentAnswerArray.length === correctAnswerArray.length &&
            studentAnswerArray.every((ans) => correctAnswerArray.includes(ans));
          
          if (isCorrect) {
            totalScore += question.marks;
          } else {
            totalScore -= question.negative_marks || 0;
          }
        } else if (question.question_type === "numerical") {
          // Numerical answer
          const correctValue = parseFloat(correctAnswers[0]);
          const studentValue = parseFloat(studentAnswer);
          
          if (Math.abs(correctValue - studentValue) < 0.01) {
            totalScore += question.marks;
          } else {
            totalScore -= question.negative_marks || 0;
          }
        }
      }
    }

    // Ensure score doesn't go negative
    totalScore = Math.max(0, totalScore);

    // Update session with score and status
    const [updatedSession] = await db
      .update(examSessions)
      .set({
        score: totalScore,
        end_time: new Date(),
        status: "completed",
        updated_at: new Date(),
      })
      .where(eq(examSessions.id, parseInt(sessionId)))
      .returning();

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data: {
        session: updatedSession,
        score: totalScore,
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit exam",
      error: error.message,
    });
  }
};

// Get exam result with detailed analysis
export const getExamResult = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;

    // Get exam session
    const [session] = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, parseInt(sessionId)));

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exam session not found",
      });
    }

    // Verify session belongs to student
    if (session.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if exam is completed
    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Exam has not been completed yet",
      });
    }

    // Get test details
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, session.test_id));

    // Get all questions with correct answers and explanations
    const testQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.test_id, session.test_id))
      .orderBy(asc(questions.order));

    // Build detailed result
    const answers = session.answers || {};
    const questionResults = testQuestions.map((question) => {
      const studentAnswer = answers[question.id.toString()];
      let isCorrect = false;
      let scoreEarned = 0;

      if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== "") {
        if (question.question_type === "mcq" || question.question_type === "true_false") {
          isCorrect = studentAnswer === question.correct_answers[0];
          scoreEarned = isCorrect ? question.marks : -(question.negative_marks || 0);
        } else if (question.question_type === "multiple_correct") {
          const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
          const correctAnswerArray = Array.isArray(question.correct_answers) ? question.correct_answers : [question.correct_answers];
          
          isCorrect = 
            studentAnswerArray.length === correctAnswerArray.length &&
            studentAnswerArray.every((ans) => correctAnswerArray.includes(ans));
          
          scoreEarned = isCorrect ? question.marks : -(question.negative_marks || 0);
        } else if (question.question_type === "numerical") {
          const correctValue = parseFloat(question.correct_answers[0]);
          const studentValue = parseFloat(studentAnswer);
          isCorrect = Math.abs(correctValue - studentValue) < 0.01;
          scoreEarned = isCorrect ? question.marks : -(question.negative_marks || 0);
        }
      }

      return {
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        student_answer: studentAnswer,
        correct_answers: question.correct_answers,
        explanation: question.explanation,
        is_correct: isCorrect,
        marks: question.marks,
        score_earned: scoreEarned,
      };
    });

    const totalQuestions = testQuestions.length;
    const attemptedQuestions = Object.keys(answers).filter(
      (key) => answers[key] !== undefined && answers[key] !== null && answers[key] !== ""
    ).length;
    const correctAnswers = questionResults.filter((q) => q.is_correct).length;
    const incorrectAnswers = attemptedQuestions - correctAnswers;
    const unattempted = totalQuestions - attemptedQuestions;

    res.status(200).json({
      success: true,
      data: {
        session: {
          id: session.id,
          start_time: session.start_time,
          end_time: session.end_time,
          score: session.score,
        },
        test: {
          name: test.name,
          subject: test.subject,
          total_marks: test.total_marks,
          duration: test.duration,
        },
        summary: {
          total_questions: totalQuestions,
          attempted: attemptedQuestions,
          unattempted: unattempted,
          correct: correctAnswers,
          incorrect: incorrectAnswers,
          score: session.score,
          percentage: ((session.score / test.total_marks) * 100).toFixed(2),
        },
        questions: questionResults,
      },
    });
  } catch (error) {
    console.error("Error fetching exam result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam result",
      error: error.message,
    });
  }
};

// Get ongoing session (to resume exam)
export const getOngoingSession = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user.id;

    const [session] = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.test_id, parseInt(testId)),
          eq(examSessions.student_id, studentId),
          eq(examSessions.status, "in_progress")
        )
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No ongoing session found",
      });
    }

    // Get test details
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    // Get questions
    const testQuestions = await db
      .select({
        id: questions.id,
        question_text: questions.question_text,
        question_type: questions.question_type,
        options: questions.options,
        marks: questions.marks,
        negative_marks: questions.negative_marks,
        order: questions.order,
      })
      .from(questions)
      .where(eq(questions.test_id, parseInt(testId)))
      .orderBy(asc(questions.order));

    res.status(200).json({
      success: true,
      data: {
        session: session,
        test: test,
        questions: testQuestions,
      },
    });
  } catch (error) {
    console.error("Error fetching ongoing session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ongoing session",
      error: error.message,
    });
  }
};
