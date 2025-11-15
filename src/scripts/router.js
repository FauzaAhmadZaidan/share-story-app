import { renderLoginPage } from '../pages/login.js';
import { renderRegisterPage } from '../pages/register.js';
import { renderHomePage } from '../pages/home.js';
import { renderAddStoryPage } from '../pages/addStory.js';
import { renderSavedStoryPage } from '../pages/savedStory.js';

export function router() {
  const hash = location.hash || '#/login';

  const renderPage = () => {
    if (hash.startsWith('#/login')) renderLoginPage();
    else if (hash.startsWith('#/register')) renderRegisterPage();
    else if (hash.startsWith('#/home')) renderHomePage();
    else if (hash.startsWith('#/add')) renderAddStoryPage();
    else if (hash.startsWith('#/saved')) renderSavedStoryPage();
    else renderLoginPage();
  };

  if (document.startViewTransition) {
    document.startViewTransition(renderPage);
  } else {
    renderPage();
  }
}
