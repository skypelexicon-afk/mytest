import { db } from "../db/client.js";
import { tests, questions, users } from "../schema/schema.js";
import { eq, and, desc } from "drizzle-orm";

// Default NTA-style instructions
const DEFAULT_INSTRUCTIONS = `# General Instructions

1. **Total Duration:** The test duration is mentioned on the test details page. Make sure to complete the test within the allotted time.

2. **Question Navigation:**
   - Use the question palette on the right side to navigate between questions
   - You can mark questions for review and come back to them later
   - Attempted questions will be marked in green
   - Unattempted questions will be shown in white
   - Questions marked for review will be shown in purple

3. **Answering Questions:**
   - Read each question carefully before selecting your answer
   - For MCQ questions, select only one correct option
   - For Multiple Correct questions, select all applicable options
   - For True/False questions, select the appropriate option
   - For Numerical questions, enter the numerical value in the provided field

4. **Marking Scheme:**
   - Each question carries marks as mentioned
   - Negative marking may apply for incorrect answers
   - No marks will be deducted for unattempted questions

5. **Submission:**
   - Click on "Submit Test" button to submit your answers
   - You will be asked to confirm before final submission
   - Once submitted, you cannot modify your answers
   - Test will be auto-submitted when the timer runs out

6. **Important Points:**
   - Do not refresh the page during the test
   - Do not use the browser back button
   - Ensure stable internet connection throughout the test
   - Save your answers frequently using the "Save" button

**All the best!**`;

// Create a new test
export const createTest = async (req, res) => {
  try {
    const { name, subject, duration, totalMarks, numQuestions, description } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate user is an educator
    if (req.user.role !== 'educator' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Only educators can create tests" 
      });
    }

    // Validate required fields
    if (!name || !subject || !duration || !totalMarks || !numQuestions) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Create test with default instructions
    const [newTest] = await db.insert(tests).values({
      name,
      subject,
      duration: parseInt(duration),
      total_marks: parseInt(totalMarks),
      num_questions: parseInt(numQuestions),
      description: description || null,
      instructions: DEFAULT_INSTRUCTIONS,
      status: "draft",
      created_by: userId,
    }).returning();

    res.status(201).json({ 
      success: true, 
      message: "Test created successfully",
      data: newTest 
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create test",
      error: error.message 
    });
  }
};

// Get all tests created by educator
export const getMyTests = async (req, res) => {
  try {
    const userId = req.user.id;

    const myTests = await db
      .select()
      .from(tests)
      .where(eq(tests.created_by, userId))
      .orderBy(desc(tests.created_at));

    res.status(200).json({ 
      success: true, 
      data: myTests 
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch tests",
      error: error.message 
    });
  }
};

// Get single test by ID
export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(id)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    // Check if user is the creator or an admin
    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to access this test" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: test 
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch test",
      error: error.message 
    });
  }
};

// Update test instructions
export const updateInstructions = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructions } = req.body;
    const userId = req.user.id;

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(id)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this test" 
      });
    }

    // Update instructions
    const [updatedTest] = await db
      .update(tests)
      .set({ 
        instructions,
        updated_at: new Date() 
      })
      .where(eq(tests.id, parseInt(id)))
      .returning();

    res.status(200).json({ 
      success: true, 
      message: "Instructions updated successfully",
      data: updatedTest 
    });
  } catch (error) {
    console.error("Error updating instructions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update instructions",
      error: error.message 
    });
  }
};

// Publish test
export const publishTest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(id)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to publish this test" 
      });
    }

    // Check if test has questions
    const testQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.test_id, parseInt(id)));

    if (testQuestions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot publish test without questions" 
      });
    }

    if (testQuestions.length !== test.num_questions) {
      return res.status(400).json({ 
        success: false, 
        message: `Test should have exactly ${test.num_questions} questions. Currently has ${testQuestions.length} questions.` 
      });
    }

    // Publish test
    const [publishedTest] = await db
      .update(tests)
      .set({ 
        status: "published",
        updated_at: new Date() 
      })
      .where(eq(tests.id, parseInt(id)))
      .returning();

    res.status(200).json({ 
      success: true, 
      message: "Test published successfully",
      data: publishedTest 
    });
  } catch (error) {
    console.error("Error publishing test:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to publish test",
      error: error.message 
    });
  }
};

// Delete test
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(id)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to delete this test" 
      });
    }

    // Delete test (questions will be cascade deleted)
    await db.delete(tests).where(eq(tests.id, parseInt(id)));

    res.status(200).json({ 
      success: true, 
      message: "Test deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete test",
      error: error.message 
    });
  }
};

// Update test details
export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, duration, totalMarks, numQuestions, description } = req.body;
    const userId = req.user.id;

    // Check if test exists and user is the creator
    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, parseInt(id)));

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }

    if (test.created_by !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this test" 
      });
    }

    // Update test
    const updateData = {
      updated_at: new Date()
    };
    
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (duration) updateData.duration = parseInt(duration);
    if (totalMarks) updateData.total_marks = parseInt(totalMarks);
    if (numQuestions) updateData.num_questions = parseInt(numQuestions);
    if (description !== undefined) updateData.description = description;

    const [updatedTest] = await db
      .update(tests)
      .set(updateData)
      .where(eq(tests.id, parseInt(id)))
      .returning();

    res.status(200).json({ 
      success: true, 
      message: "Test updated successfully",
      data: updatedTest 
    });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update test",
      error: error.message 
    });
  }
};
