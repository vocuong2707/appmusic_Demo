const $  = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = document.querySelector("header h2");
const titleThumb = document.querySelector(".cd-thumb");
const audio = document.querySelector("#audio");
const btnPlay = document.querySelector('.btn-toggle-play');
const player = document.querySelector('.player');
const progress = document.querySelector('#progress');
const nextBtn = document.querySelector('.btn-next');
const preBtn = document.querySelector('.btn-prev');
const randomBtn = document.querySelector('.btn-random');
const repeat = document.querySelector('.btn-repeat');
const playlist = document.querySelector('.playlist');
const PLAYER_STORAGE_KEY = 'F8-PLAYER';
const app = {
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    currentIndex : 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    settings: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Bao Nhiêu Tiền Một Mớ Bình Yên',
            singer: '14Casper & Bon',
            img : '../AppMusic/IMG//hinh3.png',
            audio: '../AppMusic/AUDIO/audio2.mp3'
        } ,
        {
            name: 'Già Cùng Nhau Là Được',
            singer: 'TeA',
            img : '../AppMusic/IMG//hinh4.png',
            audio: '../AppMusic/AUDIO/audio3.mp3'
        },
        {
            name: 'Muôn Nói Với Em',
            singer: 'TTeam',
            img : '../AppMusic/IMG//hinh5.png',
            audio: '../AppMusic/AUDIO/audio4.mp3'
        },
        {
            name: 'Thanh Xuân',
            singer: 'Da LAB',
            img : '../AppMusic/IMG//hinh6.png',
            audio: '../AppMusic/AUDIO/audio5.mp3'
        },
        {
            name: 'Sao Em Nỡ',
            singer: 'Jaykii ft Hiên Hồ',
            img : '../AppMusic/IMG//hinh7.png',
            audio: '../AppMusic/AUDIO/audio6.mp3'
        },
        {
            name: 'Ngày Không Có Em',
            singer: 'Thịnk',
            img : '../AppMusic/IMG//hinh8.png',
            audio: '../AppMusic/AUDIO/audio7.mp3'
        },
        {
            name: 'Mãi Mãi Không Phải Anh',
            singer: 'Thanh Bình',
            img : '../AppMusic/IMG//hinh9.png',
            audio: '../AppMusic/AUDIO/audio8.mp3'
        },
        {
            name: 'Chúng Ta Của Sau Này',
            singer: 'Vu Khang',
            img : '../AppMusic/IMG//hinh10.png',
            audio: '../AppMusic/AUDIO/audio9.mp3'
        }

    ]
    ,
    setConfig: function(key,value) {
        this.settings[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.settings));
    }
    ,
    render : function() {
       var htmls =  this.songs.map((data, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
            <div class="thumb" style="background-image: url('${data.img}')">
            </div>
            <div class="body">
              <h3 class="title">${data.name}</h3>
              <p class="author">${data.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        var html = htmls.join('');
        playlist.innerHTML = html;
    }
    ,

    handleEvent : function(){
        const cdElement = document.querySelector('.cd');
        const cdWitd = cdElement.offsetWidth;


        // Xu Ly Cd-thum quay // dung
       const animate =  titleThumb.animate([
            {transform : 'rotate(360deg)'}
        ], {
            duration : 10000,
            iterations : Infinity
        });
        animate.pause();
        //Xu Ly Oncroll
        document.onscroll = function() { 
          const scrollY =  Math.floor(window.scrollY);
          const newWidth = cdWitd - scrollY;
         if(newWidth > 0) {
            cdElement.style.width = newWidth + 'px';
            cdElement.style.opacity = newWidth / cdWitd;
         }
         else {
             cdElement.style.width = 0;
         }
        }
        //Xu ly Play
        btnPlay.onclick = function() {
            if(app.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();    
            }
        }
        audio.onplay = function() {
               app.isPlaying = true;
               player.classList.add('playing');
               animate.play();
            }
           audio.onpause = function() {
               app.isPlaying = false;
               player.classList.remove('playing');
               animate.pause();
           }
           //Xu ly tien do bai hat
           audio.ontimeupdate = function() {
               if(audio.duration) {
                const currentProgress = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = currentProgress;
               }
           }
           audio.onended = () =>{
                if(this.isRepeat) {
                    audio.play();
                }
                else {
                    app.audioEnded();
                }

           } 
           //xu ly khi tua bai hat
           progress.oninput = (e) => {
               const seekTime =  Math.floor(e.target.value * audio.duration) / 100
               audio.currentTime = seekTime;
           }

           //khi next
           nextBtn.onclick = function() {
               if(app.isRandom) {
                app.randomSong();
               }
               else {
                app.nextSong();
               }
               audio.play();
               app.render();
               app.scrollToActiveSong();
           };
           preBtn.onclick = function() {
               if(app.isRandom) {
                   app.randomSong();
               }
               else {
                app.prevSong();
               }   
               audio.play();
               app.render();
               app.scrollToActiveSong();
           };
           randomBtn.onclick = function(e) {
                app.isRandom = !app.isRandom;
                app.setConfig('isRandom' , app.isRandom);
                randomBtn.classList.toggle('active', app.isRandom);  

           }
           repeat.onclick = function() {
               app.isRepeat = !app.isRepeat
               app.setConfig('isRepeat' , app.isRepeat); 
               repeat.classList.toggle('active',app.isRepeat);
               app.loadCurrentSong();
           }
           playlist.onclick = (e) => {
               const songNode = e.target.closest('.song:not(.active)');
                if(songNode || e.target.closest('.option')) {
                    //xu ly click vao song
                    if(songNode) {
                        app.currentIndex = Number(songNode.getAttribute('data-index'));
                        app.loadCurrentSong();
                        audio.play();
                        app.render();
                    }
                    //Xu ly vao option
                    if (e.target.closest('.option')) {

                    }
                }
           }
    },
    loadConfig : () => {
        app.isRandom = app.settings.isRandom
        app.isRepeat = app.settings.isRepeat
        randomBtn.classList.toggle('active', app.isRandom);  
        repeat.classList.toggle('active',app.isRepeat);
    }
    ,
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong : function() {
        if(this.currentIndex <= 0) {
            this.currentIndex = this.songs.length;
        }
        this.currentIndex--;
        this.loadCurrentSong();
    },
    randomSong : function() {
        let newIndex = Math.floor(Math.random() * this.songs.length);
        let listPlay = [];
        if(newIndex !== this.currentIndex) {
            this.currentIndex = newIndex;
            this.loadCurrentSong();
        }
        else {
            this.randomSong();
        }
        
    },

    audioEnded : function() {
        if(this.isRandom) {
            app.randomSong();
            audio.play();
            app.render();
        }
        else {
            nextBtn.click();
        }
    }

    ,
    defineProperties : function() {
        Object.defineProperty(this,'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    scrollToActiveSong : () => {
        setTimeout(() => {
            document.querySelector('.song.active').scrollIntoView ({
                behavior : 'smooth',
                block : 'end',
                inline : "nearest"
            })
        }, 400)
    }
    ,
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        titleThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.audio;
    }
,
    start : function() {
        this.loadConfig();
        this.defineProperties();
        this.loadCurrentSong();
        this.handleEvent();
      
         this.render();

        
    }
}
app.start();