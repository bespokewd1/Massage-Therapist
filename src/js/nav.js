function setDropdown(dropdown, expanded) {
  dropdown.classList.toggle('cs-active', expanded);
  dropdown.querySelector('.cs-dropdown-button')?.setAttribute('aria-expanded', String(expanded));
}

function closeDropdowns() {
  document.querySelectorAll('#cs-navigation .cs-dropdown').forEach((dropdown) => setDropdown(dropdown, false));
}

function setMenu(expanded, restoreFocus = false) {
  const toggle = document.getElementById('mobile-menu-toggle');
  const navigation = document.getElementById('cs-navigation');
  if (!toggle || !navigation) return;

  toggle.classList.toggle('cs-active', expanded);
  navigation.classList.toggle('cs-active', expanded);
  document.body.classList.toggle('cs-open', expanded);
  toggle.setAttribute('aria-expanded', String(expanded));
  if (!expanded) closeDropdowns();
  if (restoreFocus) toggle.focus();
}

// Delegated listeners survive Astro swaps without holding on to the old menu.
document.addEventListener('click', (event) => {
  if (event.target.closest?.('dialog[open]')) return;

  if (event.target.closest?.('#mobile-menu-toggle')) {
    const toggle = document.getElementById('mobile-menu-toggle');
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    return;
  }

  const dropdownButton = event.target.closest?.('#cs-navigation .cs-dropdown-button');
  if (dropdownButton) {
    const dropdown = dropdownButton.closest('.cs-dropdown');
    setDropdown(dropdown, dropdownButton.getAttribute('aria-expanded') !== 'true');
    return;
  }

  if (event.target.closest?.('#cs-navigation a[href]') || !event.target.closest?.('#cs-navigation')) {
    setMenu(false);
  }
});

document.addEventListener('keydown', (event) => {
  // Let the native dialog close and restore focus before handling the menu.
  if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
  const dropdown = event.target.closest?.('#cs-navigation .cs-dropdown.cs-active');
  if (dropdown) {
    setDropdown(dropdown, false);
    dropdown.querySelector('.cs-dropdown-button')?.focus();
    event.preventDefault();
    return;
  }

  if (document.getElementById('mobile-menu-toggle')?.getAttribute('aria-expanded') === 'true') {
    setMenu(false, true);
    event.preventDefault();
  }
});

document.addEventListener('focusout', (event) => {
  const dropdown = event.target.closest?.('#cs-navigation .cs-dropdown');
  if (dropdown && !dropdown.contains(event.relatedTarget)) setDropdown(dropdown, false);
});

document.addEventListener('astro:before-swap', () => setMenu(false));
document.addEventListener('astro:page-load', () => setMenu(false));
