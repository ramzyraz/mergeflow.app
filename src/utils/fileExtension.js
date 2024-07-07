export const getFileExtension = (name) => {
    const parts = name.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1];
    } else {
      return "";
    }
}