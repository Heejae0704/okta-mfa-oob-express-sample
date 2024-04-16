async function checkPolling() {
  const interval = setInterval(async () => {
    const res = await fetch('/auth/mfa-polling-check', {
      method: 'post',
    })
    console.log(res.status);
    if (res.status == 200) {
      const data = await res.json()
      clearInterval(interval);
      if (data.originalUrl) {
        window.location.replace(data.originalUrl)
      } else {
        window.location.replace('/')
      }
    }
  }, 5000)
}

checkPolling();