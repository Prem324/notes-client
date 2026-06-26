function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="message message-error" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;