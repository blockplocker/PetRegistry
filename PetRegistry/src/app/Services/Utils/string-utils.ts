export class StringUtils {
  static capitalizeFirst(value: string) {
    return value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : value;
  }
  static sanitizeInput(value: string) {
    if (!value) return value;
    value = value.replace(/<[^>]*>/gm, ''); // Remove HTML tags
    value = value.replace(/[<>'"&]/g, ''); // Remove special characters
    value = value.trim(); // Trim whitespace
    return value;
  }
}
