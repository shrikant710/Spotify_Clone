console.log("let go javascript")
let currentsong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')


    return `${formattedMinutes}:${formattedSeconds}`

}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="music.svg" alt="">
                         <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>shrikant</div>
                            </div>
                         <div class="playnow">
                                <span>Play Now</span>
                             <img class="invert" src="play.svg" alt="">
                             
                            </div>   
                        
        
        </li>`
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {


                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        })
    }

    return songs
}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    // audio.play()\
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"
    }
    // currentsong.play()
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}


async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5501/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    // let folder = [];  
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0])
            //get  the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card ">
        <div class="play">
            
                <svg width="16" height="16" viewbox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">

                    <path d="M5 20V4L19 12L5 20Z" stroke="#121B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
    </div>`
        }

    }

    //load the song as the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])

        })
    });

}

async function main() {

    //show all the music in playlist
    await getsongs("songs/ncs");
    playMusic(songs[0], true);
    //Display album 
    displayAlbums()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "play.svg"

        }
    })
    //time of song
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })
    // add a event to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })
    //add event to hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    //add event to close 

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left ").style.left = "-120%"
    })
    //add event listener for previous and next
    previous.addEventListener("click", () => {
        currentsong.pause()
        console.log("Previous clicked")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //now volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg") 
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src =  e.target.src.replace("mute.svg","volume.svg") 
            currentsong.volume = .1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}
main()

