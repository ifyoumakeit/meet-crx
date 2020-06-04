{
  const $CONTAINER = "#yDmH0d";
  const $MUTE = "[aria-label^='Mute']";
  const $CONFIRM = "[data-id='EBS5u']";
  const $SIDEBAR_SHOW = "[aria-label='Show participant options']";
  const $SIDEBAR_OPEN = ".mKBhCf.kjZr4";
  const $USER = ".XWGOtd";
  const $ACTION = "[aria-label^='Show more actions']";
  const $REMOVE = "[aria-label^='Remove']";
  const $COUNT = ".wnPUne.N0PJ8e";

  async function waitFor(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  async function waitOn(selector, valid = el => el, MAX = 500, ADD = 100) {
    function check(resolve, reject, timeout = 0) {
      const container = document.querySelector(selector);
      if (valid(container)) return resolve(container);
      if (timeout + ADD >= MAX) return reject("Element not found");
      return setTimeout(() => check(resolve, reject, timeout + ADD), ADD);
    }
    return new Promise(check);
  }

  function createButton(text, onClick) {
    const button = document.createElement("button");
    button.innerText = text;
    button.addEventListener("click", onClick);
    return button;
  }

  const parseElInt = el => parseInt(el.textContent);
  const click = el => el.click();

  async function openSidebar() {
    // Clicking button closes menu.
    // Wait until fully closed before clicking.
    await waitFor(500);
    await waitOn($SIDEBAR_SHOW).then(click);
    await waitOn($SIDEBAR_OPEN);
  }

  async function muteAll() {
    // MUTE ALL USERS IN ROOM
    // Mutes everyone but host.
    const count = await waitOn($COUNT).then(parseElInt);
    await openSidebar();
    for (let i = 1; i <= count; i++) {
      try {
        const prefix = selector => `${$USER}:nth-child(${i + 1}) ${selector}`;
        await waitOn(prefix($ACTION)).then(click);
        await waitOn(prefix($MUTE)).then(click);
        await waitOn($CONFIRM).then(click);
      } catch (err) {
        console.log("User is already muted", err);
      }
    }
  }

  async function bootAll() {
    // REMOVE ALL USERS FROM ROOM
    // Uses count to check that each user is removed.
    const count = await waitOn($COUNT).then(parseElInt);
    await openSidebar();
    for (let i = 0; i <= count - 1; i++) {
      await waitOn($ACTION).then(click);
      await waitOn($REMOVE).then(click);
      await waitOn($CONFIRM).then(click);
      await waitOn($COUNT, el => parseElInt(el) === count - 1);
    }
  }

  // APPEND BUTTONS TO DOCUMENT
  function main() {
    const meet = document.createElement("div");
    meet.setAttribute("id", "meet-me");
    meet.appendChild(createButton("Mute All", muteAll));
    meet.appendChild(createButton("Boot All", bootAll));
    document.querySelector($CONTAINER).appendChild(meet);
  }

  main();
}
