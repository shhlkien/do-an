export function createElement(tagName, attrs) {

  const el = document.createElement(tagName);

  for (const attr in attrs)
    if (attrs.hasOwnProperty(attr))
      el.setAttribute(attr, attrs[attr]);

  return el;
}

export function removeChilds(parent) {

  if (parent)
    while (parent.firstChild)
      parent.removeChild(parent.firstChild);
}