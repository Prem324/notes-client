# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> profile picture upload validates file type and size
- Location: tests\e2e\auth.spec.js:266:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/notes/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/login"

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
  - heading "Login" [level=1]
  - alert: Too many login attempts. Please try again later.
  - heading "Login" [level=2]
  - text: Email
  - textbox "Email":
    - /placeholder: Enter your email
    - text: prem324r@gmail.com
  - text: Password
  - textbox "Password":
    - /placeholder: Enter your password
    - text: Prem@321
  - button "Login"
  - paragraph:
    - text: Forgot your password?
    - link "Reset it":
      - /url: /forgot-password
- contentinfo:
  - paragraph: © 2026 Notes App
- region "Notifications Alt+T"
```

# Test source

```ts
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
  208 |   await page.goto("/login");
  209 | 
  210 |   await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  211 |   await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);
  212 | 
  213 |   await page.getByRole("button", { name: "Login" }).click();
  214 | 
  215 |   await expect(page).toHaveURL(/\/notes/);
  216 | 
  217 |   // Go to profile
  218 |   await page.getByRole("link", { name: "Profile" }).click();
  219 | 
  220 |   await expect(page).toHaveURL(/\/profile/);
  221 | 
  222 |   await expect(
  223 |     page.getByRole("heading", { name: "Profile", exact: true })
  224 |   ).toBeVisible();
  225 | 
  226 |   // Make sure a profile picture exists first.
  227 |   const deleteButton = page.getByRole("button", {
  228 |     name: "Delete Profile Picture",
  229 |   });
  230 | 
  231 |   if (!(await deleteButton.isVisible())) {
  232 |     const imageBuffer = Buffer.from(
  233 |       "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  234 |       "base64"
  235 |     );
  236 | 
  237 |     const fileName = `playwright-profile-${Date.now()}.png`;
  238 | 
  239 |     await page.locator("#profilePicture").setInputFiles({
  240 |       name: fileName,
  241 |       mimeType: "image/png",
  242 |       buffer: imageBuffer,
  243 |     });
  244 | 
  245 |     await page
  246 |       .getByRole("button", { name: "Upload Profile Picture" })
  247 |       .click();
  248 | 
  249 |     await expect(page.locator(".profile-image")).toBeVisible();
  250 |     await expect(deleteButton).toBeVisible();
  251 |   }
  252 | 
  253 |   // Delete profile picture
  254 |   await deleteButton.click();
  255 | 
  256 |   // Profile picture should disappear
  257 |   await expect(page.locator(".profile-image")).toHaveCount(0);
  258 | 
  259 |   // Placeholder should appear
  260 |   await expect(page.locator(".profile-placeholder")).toBeVisible();
  261 | 
  262 |   // Delete button should disappear
  263 |   await expect(deleteButton).toHaveCount(0);
  264 | });
  265 | 
  266 | test("profile picture upload validates file type and size", async ({ page }) => {
  267 |   // Login
  268 |   await page.goto("/login");
  269 | 
  270 |   await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL);
  271 |   await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD);
  272 | 
  273 |   await page.getByRole("button", { name: "Login" }).click();
  274 | 
> 275 |   await expect(page).toHaveURL(/\/notes/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  276 | 
  277 |   // Go to profile
  278 |   await page.getByRole("link", { name: "Profile" }).click();
  279 | 
  280 |   await expect(page).toHaveURL(/\/profile/);
  281 | 
  282 |   // Invalid file type
  283 |   const invalidFile = Buffer.from("This is not an image");
  284 | 
  285 |   await page.locator("#profilePicture").setInputFiles({
  286 |     name: "invalid.txt",
  287 |     mimeType: "text/plain",
  288 |     buffer: invalidFile,
  289 |   });
  290 | 
  291 |   await expect(
  292 |     page.getByText("Please select an image file")
  293 |   ).toBeVisible();
  294 | 
  295 |   // Oversized file
  296 |   const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
  297 | 
  298 |   await page.locator("#profilePicture").setInputFiles({
  299 |     name: "large-image.png",
  300 |     mimeType: "image/png",
  301 |     buffer: largeBuffer,
  302 |   });
  303 | 
  304 |   await expect(
  305 |     page.getByText("Image must be less than 5MB")
  306 |   ).toBeVisible();
  307 | });
  308 | 
  309 | test("unauthenticated user is redirected from profile to login", async ({
  310 |   page,
  311 | }) => {
  312 |   await page.goto("/profile");
  313 | 
  314 |   await expect(page).toHaveURL(/\/login/);
  315 | 
  316 |   await expect(
  317 |     page.getByRole("heading", { name: "Login", level: 1 })
  318 |   ).toBeVisible();
  319 | });
  320 | 
  321 | test("unauthenticated user is redirected from note details to login", async ({
  322 |   page,
  323 | }) => {
  324 |   await page.goto("/notes/123");
  325 | 
  326 |   await expect(page).toHaveURL(/\/login/);
  327 | 
  328 |   await expect(
  329 |     page.getByRole("heading", { name: "Login", level: 1 })
  330 |   ).toBeVisible();
  331 | });
```