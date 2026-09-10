import { test, expect } from "@playwright/test";

test("login form validates required fields", async ({ page }) => {
    await page.goto("/login");

    await expect(
        page.getByRole("heading", { name: "Login" }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "Login" }).click();

    await expect(
        page.getByText("Email is required")
    ).toBeVisible();

    await expect(
        page.getByText("Password is required")
    ).toBeVisible();
});


test("login form validates email and password format", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("invalid");

    await page.getByLabel("Password").fill("123");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(
        page.getByText("Please enter a valid email address")
    ).toBeVisible();

    await expect(
        page.getByText("Password must be at least 6 characters long")
    ).toBeVisible();
});


test("user can login successfully", async ({ page }) => {
  await page.goto("/login");

  console.log("E2E_USER_EMAIL:", process.env.E2E_USER_EMAIL);
  console.log(
    "E2E_USER_PASSWORD:",
    process.env.E2E_USER_PASSWORD ? "SET" : "MISSING"
  );

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  page.on("console", (msg) => {
    console.log("BROWSER:", msg.text());
  });

  page.on("requestfailed", (request) => {
    console.log(
      "REQUEST FAILED:",
      request.method(),
      request.url(),
      request.failure()?.errorText
    );
  });

  page.on("response", async (response) => {
    if (response.url().includes("/auth/login")) {
      console.log(
        "LOGIN RESPONSE:",
        response.status(),
        response.url()
      );

      try {
        console.log("LOGIN BODY:", await response.text());
      } catch {
        console.log("Could not read login response");
      }
    }
  });

  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForTimeout(1000);

  console.log("CURRENT URL:", page.url());
  console.log("PAGE TEXT:", await page.locator("body").innerText());

  await expect(page).toHaveURL(/\/notes/);

  await expect(
    page.getByRole("heading", { name: "Notes" })
  ).toBeVisible();
});

test("user can register successfully", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("Name").fill("Playwright Test User");
  await page.getByLabel("Email").fill(process.env.E2E_REGISTER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_REGISTER_PASSWORD);

  await page.getByRole("button", { name: "Register" }).click();

  await expect(
    page.getByRole("heading", { name: "Check Your Email" })
  ).toBeVisible();

  await expect(
    page.getByText(process.env.E2E_REGISTER_EMAIL)
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Go to Login" })
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Resend Verification Email" })
  ).toBeVisible();
});

test("authenticated user can logout successfully", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Logout
  await page.getByRole("button", { name: "Logout" }).click();

  // User should be redirected to login
  await expect(page).toHaveURL(/\/login/);

  await expect(
    page.getByRole("heading", { name: "Login" }).first()
  ).toBeVisible();

  // Protected route should no longer be accessible
  await page.goto("/notes");

  await expect(page).toHaveURL(/\/login/);
});

test("authenticated user can upload a profile picture", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Open Profile
  await page.getByRole("link", { name: "Profile" }).click();

  await expect(page).toHaveURL(/\/profile/);

  await expect(
    page.getByRole("heading", { name: "Profile", exact:true})
  ).toBeVisible();

  // Small valid 1x1 PNG
  const imageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  );

  const fileName = `playwright-profile-${Date.now()}.png`;

  await page.locator("#profilePicture").setInputFiles({
    name: fileName,
    mimeType: "image/png",
    buffer: imageBuffer,
  });

  // Verify preview
  await expect(
    page.getByText("Preview:")
  ).toBeVisible();

  await expect(
    page.locator('img[alt="Selected profile preview"]')
  ).toBeVisible();

  // Upload
  await page
    .getByRole("button", { name: "Upload Profile Picture" })
    .click();

  // Verify uploaded profile picture
  await expect(
    page.locator(".profile-image")
  ).toBeVisible();

  // Delete button should now be available
  await expect(
    page.getByRole("button", { name: "Delete Profile Picture" })
  ).toBeVisible();
});

test("authenticated user can delete profile picture", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Go to profile
  await page.getByRole("link", { name: "Profile" }).click();

  await expect(page).toHaveURL(/\/profile/);

  await expect(
    page.getByRole("heading", { name: "Profile", exact: true })
  ).toBeVisible();

  // Make sure a profile picture exists first.
  const deleteButton = page.getByRole("button", {
    name: "Delete Profile Picture",
  });

  if (!(await deleteButton.isVisible())) {
    const imageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64"
    );

    const fileName = `playwright-profile-${Date.now()}.png`;

    await page.locator("#profilePicture").setInputFiles({
      name: fileName,
      mimeType: "image/png",
      buffer: imageBuffer,
    });

    await page
      .getByRole("button", { name: "Upload Profile Picture" })
      .click();

    await expect(page.locator(".profile-image")).toBeVisible();
    await expect(deleteButton).toBeVisible();
  }

  // Delete profile picture
  await deleteButton.click();

  // Profile picture should disappear
  await expect(page.locator(".profile-image")).toHaveCount(0);

  // Placeholder should appear
  await expect(page.locator(".profile-placeholder")).toBeVisible();

  // Delete button should disappear
  await expect(deleteButton).toHaveCount(0);
});

test("profile picture upload validates file type and size", async ({ page }) => {
  // Login
  await page.goto("/login");

  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/notes/);

  // Go to profile
  await page.getByRole("link", { name: "Profile" }).click();

  await expect(page).toHaveURL(/\/profile/);

  // Invalid file type
  const invalidFile = Buffer.from("This is not an image");

  await page.locator("#profilePicture").setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: invalidFile,
  });

  await expect(
    page.getByText("Please select an image file")
  ).toBeVisible();

  // Oversized file
  const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);

  await page.locator("#profilePicture").setInputFiles({
    name: "large-image.png",
    mimeType: "image/png",
    buffer: largeBuffer,
  });

  await expect(
    page.getByText("Image must be less than 5MB")
  ).toBeVisible();
});

test("unauthenticated user is redirected from profile to login", async ({
  page,
}) => {
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login/);

  await expect(
    page.getByRole("heading", { name: "Login", level: 1 })
  ).toBeVisible();
});

test("unauthenticated user is redirected from note details to login", async ({
  page,
}) => {
  await page.goto("/notes/123");

  await expect(page).toHaveURL(/\/login/);

  await expect(
    page.getByRole("heading", { name: "Login", level: 1 })
  ).toBeVisible();
});