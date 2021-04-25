exports.encode = (str) => {
  try {
    return Buffer.from(str).toString('base64');
  } catch (e) {}
  return '';
}
exports.decode = (str) => {
  try {
    return Buffer.from(str, 'base64').toString();
  } catch (e) {}
  return '';
}