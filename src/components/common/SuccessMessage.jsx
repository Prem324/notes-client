function SuccessMessage({ message }) {
  if (!message) {
    return null;
  }

  return <div className="message message-success">{message}</div>;
}

export default SuccessMessage;