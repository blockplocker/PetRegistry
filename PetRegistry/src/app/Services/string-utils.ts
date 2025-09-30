export class StringUtils {
  static capitalizeFirst(value: string) {
    return value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : value;
  }
}
