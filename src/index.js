import axios from "axios";
import {
  config
} from "../config";

{
  const Gify = (settings = {}) => {
    const updateEl = __checkSelector(settings.update);
    const loadingEl = __checkSelector(settings.loading);
    const resultEl = __checkSelector(settings.result);
    const alertEl = __checkSelector(settings.alert);
    const titleEl = __checkSelector(settings.title);
    let latestGiphy = [];

    function __checkSelector(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    const __toggleClass = (els, className) => {
      els.map(el => el.classList.toggle(className));
    };

    const __getData = async () => {
      __toggleClass([loadingEl, updateEl], "d-none");

      try {
        const response = await axios.get(
          `${config.GIPHY_URL}?api_key=${config.GIPHY_KEY}&limit=12`
        );
        return response.data;
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    const __renderGifs = res => {
      resultEl.innerHTML = "";

      const render = res.data.map(gif => {
        latestGiphy.push(gif.images.downsized_large.url);
        return `
          <div class="col-sm-6 col-md-4 col-lg-3 p-1">
              <img class="w-100 img-fluid" src="${gif.images.downsized_large.url}">
          </div>
        `
      }).join('');

      // const render = `
      //       <div class="col-sm-6 col-md-4 col-lg-3 p-1">
      //           <img class="w-100 img-fluid" src="${
      //             res.data.images.downsized_large.url
      //           }">
      //       </div>
      //       `;

      resultEl.innerHTML = render;
    };

    // Inform the SW (if available) of current giphy 
    const __giphyCacheClean = async giphys => {
      if (navigator.serviceWorker) {
        // Get Service Worker registration
        const registration = await navigator.serviceWorker.getRegistration();
        // Only post message to active service worker
        if (registration.active) {
          registration.active.postMessage({
            action: 'cleanGiphyCache',
            giphys: giphys
          })
        }
      }
    }

    const update = async () => {
      const data = await __getData();
      if (data) {
        __renderGifs(data);
        titleEl.style.display = "block"
        alertEl.style.display = "none";
      } else {
        alertEl.style.display = "block";
        titleEl.style.display = "none"
      }

      __giphyCacheClean(latestGiphy);

      __toggleClass([loadingEl, updateEl], "d-none");
    };

    const click = () => {
      updateEl.addEventListener("click", (e) => {
        e.preventDefault();
        update();
      });
    };

    const registerSW = async () => {
      try {
        // Register the SW
        await navigator.serviceWorker.register('/sw.js');
      } catch (err) {
        console.log('Service Worker Failed to Register', err);
      }
    };

    return Object.freeze({
      registerSW,
      update,
      click
    });
  };

  const gify = Gify({
    update: "#update ",
    loading: "#loading",
    result: "#giphys",
    alert: ".alert",
    title: '#title'
  });

  gify.registerSW();
  gify.update();
  gify.click();
}