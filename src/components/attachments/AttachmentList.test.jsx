import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import AttachmentList from "./AttachmentList";

describe("AttachmentList", () => {
  test("shows empty state when there are no attachments", () => {
    render(<AttachmentList attachments={[]} onDeleteAttachment={() => {}} />);

    expect(screen.getByText(/no attachments/i)).toBeInTheDocument();
  });

  test("renders attachments", () => {
    const attachments = [
      {
        _id: "attachment1",
        url: "https://example.com/image.png",
        fileName: "image.png",
        fileType: "image/png",
        size: 1024,
      },
      {
        _id: "attachment2",
        url: "https://example.com/file.pdf",
        fileName: "file.pdf",
        fileType: "application/pdf",
        size: 2048,
      },
    ];

    render(
      <AttachmentList
        attachments={attachments}
        onDeleteAttachment={() => {}}
      />
    );

    expect(
      screen.getByRole("link", { name: /^image\.png$/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /^file\.pdf$/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/^image\/png$/i)).toBeInTheDocument();
    expect(screen.getByText(/^application\/pdf$/i)).toBeInTheDocument();
  });

  test("calls onDeleteAttachment when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteAttachment = vi.fn();

    const attachment = {
      _id: "attachment1",
      url: "https://example.com/image.png",
      fileName: "image.png",
      fileType: "image/png",
      size: 1024,
    };

    render(
      <AttachmentList
        attachments={[attachment]}
        onDeleteAttachment={onDeleteAttachment}
      />
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDeleteAttachment).toHaveBeenCalledWith(attachment);
    expect(onDeleteAttachment).toHaveBeenCalledTimes(1);
  });

  test("shows deleting text for selected attachment", () => {
    const attachments = [
      {
        _id: "attachment1",
        url: "https://example.com/image.png",
        fileName: "image.png",
        fileType: "image/png",
        size: 1024,
      },
    ];

    render(
      <AttachmentList
        attachments={attachments}
        onDeleteAttachment={() => {}}
        deletingAttachmentId="attachment1"
      />
    );

    expect(
      screen.getByRole("button", { name: /deleting/i })
    ).toBeDisabled();
  });
});