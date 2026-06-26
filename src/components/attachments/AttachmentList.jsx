//import { formatDate } from "../../utils/formatDate";
//import { formatFileSize } from "../../utils/formatFileSize";
import Button from '../common/Button';

function AttachmentList({
  attachments = [],
  onDeleteAttachment,
  deletingAttachmentId = null,
}) {
  if (!attachments || attachments.length === 0) {
    return <p>No attachments yet</p>;
  }

  return (
  <div className="attachments-list">
    <h2>Attachments</h2>

    <div className="attachments-grid">
      {attachments.map((attachment) => {
        const isImage = attachment.fileType?.startsWith("image/");
        const isDeleting = deletingAttachmentId === attachment._id;

        return (
          <div
            className="attachment-card"
            key={attachment._id || attachment.publicId || attachment.url}
          >
            {isImage && (
              <img
                src={attachment.url}
                alt={attachment.fileName || "Attachment"}
                className="attachment-preview"
              />
            )}

            <a href={attachment.url} target="_blank" rel="noreferrer">
              {attachment.fileName || "View attachment"}
            </a>

            {attachment.fileType && <small>{attachment.fileType}</small>}

            {onDeleteAttachment && (
              <Button
                type="button"
                disabled={isDeleting}
                onClick={() => onDeleteAttachment(attachment)}
                className="btn-danger"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

}

export default AttachmentList;