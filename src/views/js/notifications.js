const NOTIFICATION_DURATION = 4500;
const REMOVE_DELAY = 220;
const MAX_NOTIFICATIONS = 4;

const notificationsContainer = document.getElementById('notifications');

export function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const text = document.createElement('p');
  text.className = 'notification__text';
  text.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'notification__close';
  closeButton.setAttribute('aria-label', 'Fechar notificação');
  closeButton.textContent = '×';

  let isLeaving = false;

  const removeNotification = () => {
    if (isLeaving) {
      return;
    }

    isLeaving = true;
    notification.classList.add('leaving');
    setTimeout(() => notification.remove(), REMOVE_DELAY);
  };

  closeButton.addEventListener('click', removeNotification);
  notification.append(text, closeButton);
  notificationsContainer.appendChild(notification);

  if (notificationsContainer.children.length > MAX_NOTIFICATIONS) {
    notificationsContainer.firstElementChild.remove();
  }

  setTimeout(removeNotification, NOTIFICATION_DURATION);
}
