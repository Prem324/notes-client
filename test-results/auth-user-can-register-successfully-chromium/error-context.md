# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> user can register successfully
- Location: tests\e2e\auth.spec.js:96:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Check Your Email' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Check Your Email' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Check Your Email' })

```

```yaml
- navigation:
  - link "Notes App":
    - /url: /
  - link "Home":
    - /url: /
  - link "Login":
    - /url: /login
  - link "Register":
    - /url: /register
- main:
  - alert: Email already exists
  - heading "Create Account" [level=2]
  - text: Name
  - textbox "Name":
    - /placeholder: Enter your name
    - text: Playwright Test User
  - text: Email
  - textbox "Email":
    - /placeholder: Enter your email
    - text: shalem3737@gmail.com
  - text: Password
  - textbox "Password":
    - /placeholder: Enter password
    - text: Shalem@123
  - button "Register"
- contentinfo:
  - paragraph: © 2026 Notes App
- region "Notifications Alt+T"
```

# Test source

```ts
  7   |         page.getByRole("heading", { name: "Login" }).first()
  8   |     ).toBeVisible();
  9   | 
  10  |     await page.getByRole("button", { name: "Login" }).click();
  11  | 
  12  |     await expect(
  13  |         page.getByText("Email is required")
  14  |     ).toBeVisible();
  15  | 
  16  |     await expect(
  17  |         page.getByText("Password is required")
  18  |     ).toBeVisible();
  19  | });
  20  | 
  21  | 
  22  | test("login form validates email and password format", async ({ page }) => {
  23  |     await page.goto("/login");
  24  | 
  25  |     await page.getByLabel("Email").fill("invalid");
  26  | 
  27  |     await page.getByLabel("Password").fill("123");
  28  | 
  29  |     await page.getByRole("button", { name: "Login" }).click();
  30  | 
  31  |     await expect(
  32  |         page.getByText("Please enter a valid email address")
  33  |     ).toBeVisible();
  34  | 
  35  |     await expect(
  36  |         page.getByText("Password must be at least 6 characters long")
  37  |     ).toBeVisible();
  38  | });
  39  | 
  40  | 
  41  | test("user can login successfully", async ({ page }) => {
  42  |   await page.goto("/login");
  43  | 
  44  |   console.log("E2E_USER_EMAIL:", process.env.E2E_USER_EMAIL);
  45  |   console.log(
  46  |     "E2E_USER_PASSWORD:",
  47  |     process.env.E2E_USER_PASSWORD ? "SET" : "MISSING"
  48  |   );
  49  | 
  50  |   await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  51  |   await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);
  52  | 
  53  |   page.on("console", (msg) => {
  54  |     console.log("BROWSER:", msg.text());
  55  |   });
  56  | 
  57  |   page.on("requestfailed", (request) => {
  58  |     console.log(
  59  |       "REQUEST FAILED:",
  60  |       request.method(),
  61  |       request.url(),
  62  |       request.failure()?.errorText
  63  |     );
  64  |   });
  65  | 
  66  |   page.on("response", async (response) => {
  67  |     if (response.url().includes("/auth/login")) {
  68  |       console.log(
  69  |         "LOGIN RESPONSE:",
  70  |         response.status(),
  71  |         response.url()
  72  |       );
  73  | 
  74  |       try {
  75  |         console.log("LOGIN BODY:", await response.text());
  76  |       } catch {
  77  |         console.log("Could not read login response");
  78  |       }
  79  |     }
  80  |   });
  81  | 
  82  |   await page.getByRole("button", { name: "Login" }).click();
  83  | 
  84  |   await page.waitForTimeout(1000);
  85  | 
  86  |   console.log("CURRENT URL:", page.url());
  87  |   console.log("PAGE TEXT:", await page.locator("body").innerText());
  88  | 
  89  |   await expect(page).toHaveURL(/\/notes/);
  90  | 
  91  |   await expect(
  92  |     page.getByRole("heading", { name: "Notes" })
  93  |   ).toBeVisible();
  94  | });
  95  | 
  96  | test("user can register successfully", async ({ page }) => {
  97  |   await page.goto("/register");
  98  | 
  99  |   await page.getByLabel("Name").fill("Playwright Test User");
  100 |   await page.getByLabel("Email").fill(process.env.E2E_REGISTER_EMAIL);
  101 |   await page.getByLabel("Password").fill(process.env.E2E_REGISTER_PASSWORD);
  102 | 
  103 |   await page.getByRole("button", { name: "Register" }).click();
  104 | 
  105 |   await expect(
  106 |     page.getByRole("heading", { name: "Check Your Email" })
> 107 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  108 | 
  109 |   await expect(
  110 |     page.getByText(process.env.E2E_REGISTER_EMAIL)
  111 |   ).toBeVisible();
  112 | 
  113 |   await expect(
  114 |     page.getByRole("link", { name: "Go to Login" })
  115 |   ).toBeVisible();
  116 | 
  117 |   await expect(
  118 |     page.getByRole("link", { name: "Resend Verification Email" })
  119 |   ).toBeVisible();
  120 | });
  121 | 
  122 | test("authenticated user can logout successfully", async ({ page }) => {
  123 |   await page.goto("/login");
  124 | 
  125 |   await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  126 |   await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);
  127 | 
  128 |   await page.getByRole("button", { name: "Login" }).click();
  129 | 
  130 |   await expect(page).toHaveURL(/\/notes/);
  131 | 
  132 |   // Logout
  133 |   await page.getByRole("button", { name: "Logout" }).click();
  134 | 
  135 |   // User should be redirected to login
  136 |   await expect(page).toHaveURL(/\/login/);
  137 | 
  138 |   await expect(
  139 |     page.getByRole("heading", { name: "Login" }).first()
  140 |   ).toBeVisible();
  141 | 
  142 |   // Protected route should no longer be accessible
  143 |   await page.goto("/notes");
  144 | 
  145 |   await expect(page).toHaveURL(/\/login/);
  146 | });
  147 | 
  148 | test("authenticated user can upload a profile picture", async ({ page }) => {
  149 |   await page.goto("/login");
  150 | 
  151 |   await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  152 |   await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);
  153 | 
  154 |   await page.getByRole("button", { name: "Login" }).click();
  155 | 
  156 |   await expect(page).toHaveURL(/\/notes/);
  157 | 
  158 |   // Open Profile
  159 |   await page.getByRole("link", { name: "Profile" }).click();
  160 | 
  161 |   await expect(page).toHaveURL(/\/profile/);
  162 | 
  163 |   await expect(
  164 |     page.getByRole("heading", { name: "Profile", exact:true})
  165 |   ).toBeVisible();
  166 | 
  167 |   // Small valid 1x1 PNG
  168 |   const imageBuffer = Buffer.from(
  169 |     "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  170 |     "base64"
  171 |   );
  172 | 
  173 |   const fileName = `playwright-profile-${Date.now()}.png`;
  174 | 
  175 |   await page.locator("#profilePicture").setInputFiles({
  176 |     name: fileName,
  177 |     mimeType: "image/png",
  178 |     buffer: imageBuffer,
  179 |   });
  180 | 
  181 |   // Verify preview
  182 |   await expect(
  183 |     page.getByText("Preview:")
  184 |   ).toBeVisible();
  185 | 
  186 |   await expect(
  187 |     page.locator('img[alt="Selected profile preview"]')
  188 |   ).toBeVisible();
  189 | 
  190 |   // Upload
  191 |   await page
  192 |     .getByRole("button", { name: "Upload Profile Picture" })
  193 |     .click();
  194 | 
  195 |   // Verify uploaded profile picture
  196 |   await expect(
  197 |     page.locator(".profile-image")
  198 |   ).toBeVisible();
  199 | 
  200 |   // Delete button should now be available
  201 |   await expect(
  202 |     page.getByRole("button", { name: "Delete Profile Picture" })
  203 |   ).toBeVisible();
  204 | });
  205 | 
  206 | test("authenticated user can delete profile picture", async ({ page }) => {
  207 |   // Login
```