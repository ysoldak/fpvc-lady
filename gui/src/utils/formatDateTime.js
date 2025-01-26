function formatDateTime(t) {
  if (t === null || t === undefined) {
    return '';
  }
  let retval = t.replace("T", " ");
  retval = retval.substring(0, 19);
  return retval;
}

export default formatDateTime