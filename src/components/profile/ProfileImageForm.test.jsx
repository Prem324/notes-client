import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ProfileImageForm from "./ProfileImageForm";

describe("ProfileImageForm", () => {
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:mock-preview-url"),
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: vi.fn(),
    });
  });

  test("renders file input and upload button", () => {
    render(<ProfileImageForm onUploadProfilePicture={() => {}} />);

    expect(
      screen.getByLabelText(/profile picture/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /upload profile picture/i })
    ).toBeInTheDocument();
  });

  test("shows validation error when no image is selected", async () => {
    const user = userEvent.setup();
    const onUploadProfilePicture = vi.fn();

    render(
      <ProfileImageForm onUploadProfilePicture={onUploadProfilePicture} />
    );

    await user.click(
      screen.getByRole("button", { name: /upload profile picture/i })
    );

    expect(
      screen.getByText(/please select an image/i)
    ).toBeInTheDocument();

    expect(onUploadProfilePicture).not.toHaveBeenCalled();
  });

  test("shows validation error when selected file is not an image", async () => {
  const user = userEvent.setup({
    applyAccept: false,
  });

  const onUploadProfilePicture = vi.fn();

  render(
    <ProfileImageForm onUploadProfilePicture={onUploadProfilePicture} />
  );

  const textFile = new File(["hello"], "notes.txt", {
    type: "text/plain",
  });

  const fileInput = screen.getByLabelText(/profile picture/i);

  await user.upload(fileInput, textFile);

  expect(
    screen.getByText(/please select an image file/i)
  ).toBeInTheDocument();

  expect(onUploadProfilePicture).not.toHaveBeenCalled();
});
   

  test("shows validation error when image is larger than 5MB", async () => {
    const user = userEvent.setup();
    const onUploadProfilePicture = vi.fn();

    render(
      <ProfileImageForm onUploadProfilePicture={onUploadProfilePicture} />
    );

    const largeImage = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "large-profile.png",
      {
        type: "image/png",
      }
    );

    const fileInput = screen.getByLabelText(/profile picture/i);

    await user.upload(fileInput, largeImage);

    expect(
      screen.getByText(/image must be less than 5mb/i)
    ).toBeInTheDocument();

    expect(onUploadProfilePicture).not.toHaveBeenCalled();
  });

  test("shows preview when valid image is selected", async () => {
    const user = userEvent.setup();

    render(<ProfileImageForm onUploadProfilePicture={() => {}} />);

    const image = new File(["fake-image"], "profile.png", {
      type: "image/png",
    });

    const fileInput = screen.getByLabelText(/profile picture/i);

    await user.upload(fileInput, image);

    expect(screen.getByText(/preview/i)).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: /selected profile preview/i })
    ).toHaveAttribute("src", "blob:mock-preview-url");
  });

  test("calls onUploadProfilePicture with FormData when image is selected", async () => {
    const user = userEvent.setup();
    const onUploadProfilePicture = vi.fn().mockResolvedValue(true);

    render(
      <ProfileImageForm onUploadProfilePicture={onUploadProfilePicture} />
    );

    const image = new File(["fake-image"], "profile.png", {
      type: "image/png",
    });

    const fileInput = screen.getByLabelText(/profile picture/i);

    await user.upload(fileInput, image);

    await user.click(
      screen.getByRole("button", { name: /upload profile picture/i })
    );

    expect(onUploadProfilePicture).toHaveBeenCalledTimes(1);

    const submittedFormData = onUploadProfilePicture.mock.calls[0][0];

    expect(submittedFormData).toBeInstanceOf(FormData);
    expect(submittedFormData.get("profilePicture")).toBe(image);
  });

  test("disables upload button when loading", () => {
    render(
      <ProfileImageForm
        onUploadProfilePicture={() => {}}
        loading={true}
      />
    );

    expect(
      screen.getByRole("button", { name: /uploading/i })
    ).toBeDisabled();
  });
});