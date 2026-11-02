/* FAAIZ.DEV — Contact form handling (validation + honest feedback).
   Sends to Supabase when configured, otherwise opens the visitor's
   email app via mailto. A success message is shown only on real success. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subjectEl = document.getElementById('subject');
    const subject = subjectEl ? subjectEl.value.trim() : '';
    const message = document.getElementById('message').value.trim();
    const status = document.getElementById('form-status');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!name || !emailOk || !message) {
      status.textContent = !emailOk && email ? 'Please enter a valid email address.' : 'Please fill in your name, a valid email and a message.';
      return;
    }
    if (status.dataset.sending === '1') return;
    status.dataset.sending = '1';
    status.textContent = 'Sending…';

    const config = window.FAAIZ_CONFIG || {};
    try {
      if (config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY && window.supabase && window.supabase.createClient) {
        const client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY);
        const { error } = await client.from('messages').insert([{ name, email, subject, message }]);
        if (error) {
          status.textContent = 'Message could not be sent. Please use the email link instead.';
          status.dataset.sending = '';
          return;
        }
        status.textContent = 'Thanks! Your message was sent.';
        form.reset();
        status.dataset.sending = '';
        return;
      }
      if (config.CONTACT_EMAIL) {
        const s = encodeURIComponent(subject ? `${subject} — portfolio message from ${name}` : `Portfolio message from ${name}`);
        const b = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        status.textContent = 'Opening your email app to send the message…';
        status.dataset.sending = '';
        window.location.href = `mailto:${config.CONTACT_EMAIL}?subject=${s}&body=${b}`;
        return;
      }
      status.textContent = 'The form is not connected yet. Please contact me through LinkedIn, or configure Supabase in js/config.js.';
    } catch (_) {
      status.textContent = 'Something went wrong while sending. Please try LinkedIn or GitHub instead.';
    }
    status.dataset.sending = '';
  });
})();
