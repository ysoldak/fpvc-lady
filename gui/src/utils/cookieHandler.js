export function setCookie(name, value, exDays) {
  var d = new Date()
  d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000))
  var expires = "expires=" + d.toUTCString()
  document.cookie = name + "=" + value + ";" + expires + ";path=/"
}

export function getCookie(name) {
  name += "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}