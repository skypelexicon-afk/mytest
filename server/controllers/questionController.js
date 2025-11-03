import { db } from "../db/client.js";
import { questions, tests } from "../schema/schema.js";
import { eq, and, asc } from "drizzle-orm";

// Add a new question
export const addQuestion = async (req, res) => {
  try {
    const { testId, questionText, questionType, options, correctAnswers, marks, negativeMarks, explanation } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!testId || !questionText || !questionType || !correctAnswers || !marks) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to add questions to this test" 
      });
    }

    // Check if test is published
    if (test.status === 'published') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot add questions to a published test" 
      });
    }

    // Validate question type
    const validTypes = ['mcq', 'multiple_correct', 'true_false', 'numerical'];
    if (!validTypes.includes(questionType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid question type" 
      });
    }

    // Validate options based on question type
    if (questionType === 'true_false') {
      // True/False should have exactly 2 options
      if (!options || options.length !== 2) {
        return res.status(400).json({ 
          success: false, 
          message: "True/False questions must have exactly 2 options" 
        });
      }
    } else if (questionType !== 'numerical') {
      // MCQ and Multiple Correct should have options
      if (!options || options.length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: "Question must have at least 2 options" 
        });
      }
    }

    // Get current question count for ordering
    const existingQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.test_id, parseInt(testId)));

    const order = existingQuestions.length + 1;

    // Create question
    const [newQuestion] = await db.insert(questions).values({
      test_id: parseInt(testId),
      question_text: questionText,
      question_type: questionType,
      options: options || null,
      correct_answers: correctAnswers,
      marks: parseInt(marks),
      negative_marks: negativeMarks ? parseFloat(negativeMarks) : 0,
      explanation: explanation || null,
      order,
    }).returning();

    res.status(201).json({ 
      success: true, 
      message: "Question added successfully",
      data: newQuestion 
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add question",
      error: error.message 
    });
  }
};

// Get all questions for a test
export const getQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    // Check if test exists
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    // Check permissions
    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to view these questions" 
      });
    }

    // Get all questions for the test
    const testQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.test_id, parseInt(testId)))
      .orderBy(asc(questions.order));

    res.status(200).json({ 
      success: true, 
      data: testQuestions 
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch questions",
      error: error.message 
    });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, questionType, options, correctAnswers, marks, negativeMarks, explanation } = req.body;
    const userId = req.user.id;

    // Get question
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)));

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, question.test_id));

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this question" 
      });
    }

    // Check if test is published
    if (test.status === 'published') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot update questions in a published test" 
      });
    }

    // Update question
    const updateData = {
      updated_at: new Date()
    };

    if (questionText) updateData.question_text = questionText;
    if (questionType) updateData.question_type = questionType;
    if (options !== undefined) updateData.options = options;
    if (correctAnswers !== undefined) updateData.correct_answers = correctAnswers;
    if (marks) updateData.marks = parseInt(marks);
    if (negativeMarks !== undefined) updateData.negative_marks = parseFloat(negativeMarks);
    if (explanation !== undefined) updateData.explanation = explanation;

    const [updatedQuestion] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, parseInt(id)))
      .returning();

    res.status(200).json({ 
      success: true, 
      message: "Question updated successfully",
      data: updatedQuestion 
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update question",
      error: error.message 
    });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get question
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)));

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, question.test_id));

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to delete this question" 
      });
    }

    // Check if test is published
    if (test.status === 'published') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete questions from a published test" 
      });
    }

    // Delete question
    await db.delete(questions).where(eq(questions.id, parseInt(id)));

    res.status(200).json({ 
      success: true, 
      message: "Question deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete question",
      error: error.message 
    });
  }
};

// Reorder questions
export const reorderQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionIds } = req.body; // Array of question IDs in desired order
    const userId = req.user.id;

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(testId)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to reorder questions" 
      });
    }

    // Update order for each question
    for (let i = 0; i < questionIds.length; i++) {
      await db
        .update(questions)
        .set({ order: i + 1 })
        .where(eq(questions.id, parseInt(questionIds[i])));
    }

    res.status(200).json({ 
      success: true, 
      message: "Questions reordered successfully" 
    });
  } catch (error) {
    console.error("Error reordering questions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reorder questions",
      error: error.message 
    });
  }
};
