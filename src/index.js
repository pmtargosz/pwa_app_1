import axios from 'axios';
import {
    config
} from '../config';

{
    const Gify = (settings = {}) => {
        const updateEl = __checkSelector(settings.update);
        const loadingEl = __checkSelector(settings.loading);
        const resultEl = __checkSelector(settings.result);
        const alertEl = __checkSelector(settings.alert);

        function __checkSelector(el) {
            return typeof el === 'string' ? document.querySelector(el) : el
        };

        const __toggleClass = (els, className) => {
            els.map(el => el.classList.toggle(className));
        };

        const __getData = async () => {
            __toggleClass([loadingEl, updateEl], 'd-none');

            try {
                const response = await axios.get(`${config.GIPHY_URL}?api_key=${config.GIPHY_KEY}&limit=20`);
                return response.data;
            } catch (error) {
                console.error(error);
                return error
            }
        };

        const __renderGifs = (res) => {
            resultEl.innerHTML = '';

            const render = res.data.map(gif => `
            <div class="col-sm-6 col-md-4 col-lg-3 p-1">
                <img class="w-100 img-fluid" src="${gif.images.downsized_large.url}">
            </div>
            `).join('');

            resultEl.innerHTML = render;
        };

        const update = async () => {
            const data = await __getData();
            if (data) {
                __renderGifs(data);
                alertEl.style.display = 'none';
            } else {
                alertEl.style.display = 'block';
            }
            __toggleClass([loadingEl, updateEl], 'd-none');

            updateEl.addEventListener('click', update);
        };


        return Object.freeze({
            update
        });
    };

    const gify = Gify({
        update: '#update ',
        loading: '#loading',
        result: '#giphys',
        alert: '.alert'
    });

    gify.update();
}