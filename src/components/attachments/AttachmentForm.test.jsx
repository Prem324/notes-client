import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import AttachmentForm from "./AttachmentForm";

describe("AttachmentForm", () => {
  test("renders file input and upload button", () => {
    render(<AttachmentForm onUploadAttachments={() => {}} />);

    expect(screen.getByLabelText(/attachments/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /upload/i })
    ).toBeInTheDocument();
  });

  test("shows validation error when no file is selected", async () => {
    const user = userEvent.setup();
    const onUploadAttachments = vi.fn();

    render(<AttachmentForm onUploadAttachments={onUploadAttachments} />);

    await user.click(screen.getByRole("button", { name: /upload/i }));

    expect(screen.getByText(/please select at least one file/i)).toBeInTheDocument();
    expect(onUploadAttachments).not.toHaveBeenCalled();
  });

  test("calls onUploadAttachments with FormData when file is selected", async () => {
    const user = userEvent.setup();
    const onUploadAttachments = vi.fn().mockResolvedValue(true);

    render(<AttachmentForm onUploadAttachments={onUploadAttachments} />);

    const file = new File(["hello"], "test.txt", {
      type: "text/plain",
    });

    const fileInput = screen.getByLabelText(/attachments/i);

    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /upload/i }));

    expect(onUploadAttachments).toHaveBeenCalledTimes(1);

    const submittedFormData = onUploadAttachments.mock.calls[0][0];

    expect(submittedFormData).toBeInstanceOf(FormData);
    expect(submittedFormData.getAll("attachments")).toHaveLength(1);
    expect(submittedFormData.getAll("attachments")[0]).toBe(file);
  });

  test("disables upload button when loading", () => {
    render(<AttachmentForm onUploadAttachments={() => {}} loading={true} />);

    expect(
      screen.getByRole("button", { name: /uploading/i })
    ).toBeDisabled();
  });
});