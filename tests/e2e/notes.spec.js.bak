import { test, expect } from "@playwright/test";

test("authenticated user can create a note", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create note
  const title = `Playwright Note ${Date.now()}`;
  const content = "This note was created by a Playwright E2E test.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  // Verify note appears
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(content)).toBeVisible();
});

test("authenticated user can edit a note", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note specifically for this test
  const originalTitle = `Edit Test ${Date.now()}`;
  const originalContent = "Original content";

  await page.getByLabel("Title").fill(originalTitle);
  await page.getByLabel("Content").fill(originalContent);

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText(originalTitle)).toBeVisible();

  // Start editing the note
  const noteCard = page.locator(".note-card").filter({
    hasText: originalTitle,
  });

  await noteCard.getByRole("button", { name: "Edit" }).click();

  // Verify edit mode
  await expect(
    page.getByRole("heading", { name: "Edit Note" })
  ).toBeVisible();

  // Update note
  const updatedTitle = `${originalTitle} Updated`;
  const updatedContent = "Updated content";

  await page.getByLabel("Title").fill(updatedTitle);
  await page.getByLabel("Content").fill(updatedContent);

  await page.getByRole("button", { name: "Update Note" }).click();

  // Verify updated note appears
  await expect(page.getByText(updatedTitle)).toBeVisible();
  await expect(page.getByText(updatedContent)).toBeVisible();
});

test("authenticated user can delete a note", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note for this test
  const title = `Delete Test ${Date.now()}`;
  const content = "This note will be deleted.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  // Locate the specific note
  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Delete the note
  await noteCard.getByRole("button", { name: "Delete" }).click();

  // Verify it disappears
  await expect(noteCard).toBeHidden();
});

test("authenticated user can toggle note completion", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a test note
  const title = `Complete Test ${Date.now()}`;
  const content = "Test completion status.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  // Find the specific note
  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Initially the note should be pending
  await expect(
    noteCard.getByText("Pending")
  ).toBeVisible();

  // Mark complete
  await noteCard
    .getByRole("button", { name: "Mark Complete" })
    .click();

  // Verify completed state
  await expect(
    noteCard.getByText("Completed")
  ).toBeVisible();

  await expect(
    noteCard.getByRole("button", { name: "Mark Pending" })
  ).toBeVisible();
});

test("authenticated user can search notes", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a unique note
  const uniqueWord = `SearchTest${Date.now()}`;
  const title = `${uniqueWord} Note`;
  const content = "This note is used to test search.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Search for the unique word
  await page.getByLabel("Search notes").fill(uniqueWord);

  await expect(noteCard).toBeVisible();
});

test("authenticated user sees empty state when search has no results", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  const searchTerm = `NoMatch${Date.now()}`;

  await page.getByLabel("Search notes").fill(searchTerm);

  await expect(
    page.getByText("No notes matched your search.")
  ).toBeVisible();
});

test("authenticated user can navigate through note pagination", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create 11 notes so pagination requires 2 pages
  for (let i = 1; i <= 11; i++) {
    await page.getByLabel("Title").fill(`Pagination Test ${Date.now()} ${i}`);
    await page.getByLabel("Content").fill(`Pagination content ${i}`);

    await page.getByRole("button", { name: "Create Note" }).click();
  }

  // We should initially be on page 1
  await expect(page.getByText(/Page 1 of 2/)).toBeVisible();

  // Go to page 2
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByText(/Page 2 of 2/)).toBeVisible();

  // Previous button should now be available
  await expect(
    page.getByRole("button", { name: "Previous" })
  ).toBeEnabled();

  // Return to page 1
  await page.getByRole("button", { name: "Previous" }).click();

  await expect(page.getByText(/Page 1 of 2/)).toBeVisible();
});

test("authenticated user can view note details", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  const title = `Details Test ${Date.now()}`;
  const content = "This note is used to test the details page.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  await noteCard.getByRole("link", { name: "View Details" }).click();

  await expect(page).toHaveURL(/\/notes\/[^/]+$/);

  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(content)).toBeVisible();
});

test("authenticated user can add a comment to a note", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note
  const title = `Comment Test ${Date.now()}`;
  const content = "This note is used to test comments.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  // Find the created note
  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Open note details
  await noteCard.getByRole("link", { name: "View Details" }).click();

  await expect(page).toHaveURL(/\/notes\/[^/]+$/);

  await expect(
    page.getByRole("heading", { name: "Note Details" })
  ).toBeVisible();

  // Add comment
  const commentText = `Playwright comment ${Date.now()}`;

  await page.getByLabel("Comment").fill(commentText);

  await page.getByRole("button", { name: "Add Comment" }).click();

  // Verify comment appears
  await expect(page.getByText(commentText)).toBeVisible();
});

test("comment form validates required and whitespace-only input", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note
  const title = `Comment Validation ${Date.now()}`;
  const content = "Comment validation test note.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Open note details
  await noteCard.getByRole("link", { name: "View Details" }).click();

  await expect(
    page.getByRole("heading", { name: "Note Details" })
  ).toBeVisible();

  // Submit without entering a comment
  await page.getByRole("button", { name: "Add Comment" }).click();

  await expect(
    page.getByText("Comment text is required")
  ).toBeVisible();

  // Enter whitespace only
  await page.getByLabel("Comment").fill("   ");

  await page.getByRole("button", { name: "Add Comment" }).click();

  await expect(
    page.getByText("Comment cannot contain only spaces")
  ).toBeVisible();
});

test("authenticated user can upload an attachment to a note", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note
  const title = `Attachment Test ${Date.now()}`;
  const content = "This note is used to test attachment upload.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  // Find the created note
  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Open note details
  await noteCard.getByRole("link", { name: "View Details" }).click();

  await expect(page).toHaveURL(/\/notes\/[^/]+$/);

  await expect(
    page.getByRole("heading", { name: "Note Details" })
  ).toBeVisible();

  // Prepare a test file
  const fileName = `playwright-attachment-${Date.now()}.pdf`;

await page.locator("#attachments").setInputFiles({
  name: fileName,
  mimeType: "application/pdf",
  buffer: Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
  ),
});
  // Verify the selected file is displayed
  await expect(page.getByText(fileName)).toBeVisible();

  // Upload
  await page
    .getByRole("button", { name: "Upload Attachments" })
    .click();

  // Verify uploaded attachment appears
  await expect(
    page.getByRole("link", { name: fileName })
  ).toBeVisible();
});

test("authenticated user can delete a note attachment", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note
  const title = `Attachment Delete Test ${Date.now()}`;
  const content = "This note is used to test attachment deletion.";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await expect(noteCard).toBeVisible();

  // Open note details
  await noteCard.getByRole("link", { name: "View Details" }).click();

  await expect(page).toHaveURL(/\/notes\/[^/]+$/);

  await expect(
    page.getByRole("heading", { name: "Note Details" })
  ).toBeVisible();

  // Upload a supported PDF file
  const fileName = `playwright-delete-${Date.now()}.pdf`;

  await page.locator("#attachments").setInputFiles({
    name: fileName,
    mimeType: "application/pdf",
    buffer: Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    ),
  });

  await page
    .getByRole("button", { name: "Upload Attachments" })
    .click();

  // Verify attachment was uploaded
  const attachment = page
    .locator(".attachment-card")
    .filter({ hasText: fileName });

  await expect(attachment).toBeVisible();

  // Delete attachment
  await attachment.getByRole("button", { name: "Delete" }).click();

  // Verify attachment was removed
  await expect(attachment).toBeHidden();

  await expect(page.getByText("No attachments yet")).toBeVisible();
});

test("note form validates title and content", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Required validation
  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText("Title is required")).toBeVisible();
  await expect(page.getByText("Content is required")).toBeVisible();

  // Title minimum length
  await page.getByLabel("Title").fill("AB");
  await page.getByLabel("Content").fill("Valid content");

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(
    page.getByText("Title must be at least 3 characters")
  ).toBeVisible();

  // Whitespace-only content
  await page.getByLabel("Title").fill("Valid title");
  await page.getByLabel("Content").fill("   ");

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(
    page.getByText("Content cannot contain only spaces")
  ).toBeVisible();
});

test("edit note form validates title", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note that we can edit
  const title = `E2E Edit Validation ${Date.now()}`;
  const content = "Original content";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText(title)).toBeVisible();

  // Start editing
  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await noteCard.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", { name: "Edit Note" })
  ).toBeVisible();

  // Invalid title
  await page.getByLabel("Title").fill("AB");

  await page.getByRole("button", { name: "Update Note" }).click();

  await expect(
    page.getByText("Title must be at least 3 characters")
  ).toBeVisible();
});

test("authenticated user can cancel note editing", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Create a note
  const title = `E2E Cancel Edit ${Date.now()}`;
  const content = "Original content";

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill(content);

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(page.getByText(title)).toBeVisible();

  // Start editing
  const noteCard = page.locator(".note-card").filter({
    hasText: title,
  });

  await noteCard.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", { name: "Edit Note" })
  ).toBeVisible();

  // Change the form values
  await page.getByLabel("Title").fill("Changed title");
  await page.getByLabel("Content").fill("Changed content");

  // Cancel
  await page.getByRole("button", { name: "Cancel" }).click();

  // Edit form should disappear
  await expect(
    page.getByRole("heading", { name: "Edit Note" })
  ).toHaveCount(0);

  // Original note should still be displayed
  await expect(page.getByText(title)).toBeVisible();
  await expect(noteCard.getByText(content)).toBeVisible();

  // Changed values should not have been saved
  await expect(page.getByText("Changed title")).toHaveCount(0);
  await expect(page.getByText("Changed content")).toHaveCount(0);
});

test("note form validates maximum title length", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Enter title longer than 100 characters
  const longTitle = "A".repeat(101);

  await page.getByLabel("Title").fill(longTitle);
  await page.getByLabel("Content").fill("Valid content");

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(
    page.getByText("Title must be less than 100 characters")
  ).toBeVisible();
});

test("note form rejects whitespace-only title", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Whitespace-only title
  await page.getByLabel("Title").fill("   ");
  await page.getByLabel("Content").fill("Valid content");

  await page.getByRole("button", { name: "Create Note" }).click();

  await expect(
    page.getByText("Title cannot contain only spaces")
  ).toBeVisible();
});

test("attachment form rejects invalid file types", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Open an existing note
  await page
    .locator(".note-card")
    .first()
    .getByRole("link", { name: "View Details" })
    .click();

  await expect(page).toHaveURL(/\/notes\/[^/]+/);

  // Try an unsupported file type
await page.locator("#attachments").setInputFiles({
  name: "invalid.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("This is not a supported attachment"),
});

// Trigger validation
await page.getByRole("button", { name: "Upload Attachments" }).click();

await expect(
  page.getByRole("main").getByText(
    "Only JPG, PNG, WEBP and PDF files are allowed",
    { exact: true }
  )
).toBeVisible();
});

test("attachment form rejects more than 5 files", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Open an existing note
  await page
    .locator(".note-card")
    .first()
    .getByRole("link", { name: "View Details" })
    .click();

  await expect(page).toHaveURL(/\/notes\/[^/]+/);

  // Select 6 valid files
  const files = Array.from({ length: 6 }, (_, index) => ({
    name: `playwright-attachment-${index}.pdf`,
    mimeType: "application/pdf",
    buffer: Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    ),
  }));

  await page.locator("#attachments").setInputFiles(files);

  // Trigger validation
  await page
    .getByRole("button", { name: "Upload Attachments" })
    .click();

  await expect(
    page.getByRole("main").getByText("You can upload maximum 5 files", {
      exact: true,
    })
  ).toBeVisible();
});

test("attachment form requires at least one file", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Open an existing note
  await page
    .locator(".note-card")
    .first()
    .getByRole("link", { name: "View Details" })
    .click();

  await expect(page).toHaveURL(/\/notes\/[^/]+/);

  // Submit without selecting any file
  await page
    .getByRole("button", { name: "Upload Attachments" })
    .click();

  await expect(
    page.getByRole("main").getByText("Please select at least one file", {
      exact: true,
    })
  ).toBeVisible();
});