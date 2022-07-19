import cookieParser from 'cookie-parser'
import express from 'express'
import fetch from 'node-fetch'

let maintenance = false;

const app = express();
app.use(cookieParser())

let counted = 2000;
setInterval(function(){
fetch('https://beta.wasteof.money/users')
  .then(data => data.text())
  .then(data => {
    counted = data;
    if (counted.toString().endsWith('00')) counted = `🎉 ${counted} 🎉`
    if (counted == 2998) counted = "2998.."
    if (counted == 2999) counted = "2999..."
    if (counted == 3000) counted = "🎉 3000 🎉"
  })
 }, 2000)

/* Pages */
app.get('/', (req, res) => {
  res.send(parseHTML(`
<span id="count" class="text-6xl block">${counted}</span>
<span class="text-4xl">money wasters (live)</span>

<hr class="m-4 sm:mx-8">

<input class="bg-slate-200 text-black rounded-lg px-4 py-2 outline-0" maxlength="20" id="username" placeholder="Username..." value="ari" />
<button class="bg-slate-200 text-black rounded-lg px-4 py-2 outline-0" onclick="window.location.href = '/users/' + document.querySelector('#username').value">View</button>

<script>
setInterval(function(){
  fetch('/api/counter')
    .then(response => response.json())
    .then(data => document.querySelector("#count").innerText = data.count)
}, 1000)
</script>
`, "home", req.cookies))
});

app.get('/users/:username', (req, res) => {
  res.send(parseHTML(`
<span id="count" class="text-6xl block">0</span>
<span class="text-4xl">${req.params.username}'s followers (live)</span>
<div class="mt-6 bg-slate-700 rounded-lg mx-auto w-3/4 xl:w-2/4 p-4 text-left">
<span class="text-4xl">Additional Information</span><span class="text-2xl block">Latest Follower:
<span id="latest"></span></span>
<span class="text-2xl block">Following:
<span id="following"></span></span>
<span class="text-2xl block">Posts:
<span id="posts"></span></span>
<span class="text-2xl block">Online:
<span id="online"></span></span>
</div>

<script>
setInterval(function(){
  fetch('/api/user/${req.params.username}')
    .then(response => response.json())
    .then(data => {
if (data.error) {
  document.body.innerText = "Invalid user.";
return;
}
      for (let i = 0; i < Object.keys(data).length; i++) {
        document.querySelector("#" + Object.keys(data)[i]).innerText = data[Object.keys(data)[i]];
      }
    })
}, 1000)
</script>
`, req.params.username, req.cookies))
});

/* API */
app.get('/api/counter', (req, res) => {
res.json({count: counted});
});

app.get('/api/user/:username', (req, res) => {
fetch('https://api.wasteof.money/users/' + req.params.username)
    .then(response=> response.json())
    .then(datax => {
if (datax.error) {res.json({error: true})
    return;}
fetch('https://api.wasteof.money/users/' + req.params.username + '/followers')
    .then(response=>response.json())
    .then(data=>res.json({count: datax.stats.followers, latest: data.followers[0].name, following: datax.stats.following, posts: datax.stats.posts, online: datax.online}))
    })
});

/* 404 */
app.get('/*', (req, res) => {
  res.send(parseHTML(`
<span class="text-6xl block">404</span>
<span class="text-2xl">Nothing here.</span>
`, "404", req.cookies))
});

/* Functions */
function parseHTML(content, title, cookies) {
  if (maintenance && cookies.m != "true") return `maintenance`;
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<title>${title} | wasteof-counter</title>
</head>
<body class="bg-slate-800 mt-12 text-white text-center">
${content}
</body>
</html>`
}

app.listen(3000, () => {
  console.log('server started');
});
