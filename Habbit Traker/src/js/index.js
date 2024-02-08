'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitID;

const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.header__title'),
        progressPercent: document.querySelector('.progress__percent'),
        progressBarCover: document.querySelector('.progress__bar-cover'),
    },
    habbit: {
        habbitDays: document.getElementById('days'),
        habbitDay: document.querySelector(".habbit__day"),
        habbitForm: document.querySelector(".habbit__form")
    },
    modal: {
        overlay: document.getElementById('modal-add-habbit'),
        iconField: document.querySelector('.input[name="icon"]')
    }
}

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('input-error');
        if (!fieldValue) {
            form[field].classList.add('input-error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    } else {
        return res;
    }
}

function rerenderMenu(activeHabbit) {
    if (!activeHabbit) {
        return;
    }
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu__item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `<img src="./img/${habbit.icon}.svg" alt="${habbit.name}">`;
            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu__item-active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu__item-active');
        } else {
            existed.classList.remove('menu__item-active');
        }
    }
}

function percentage(total, days) {
    return days.length / total > 1
        ? 100
        : (days.length * 100) / total;
}

function renderHead(activeHabbit) {
    if (!activeHabbit) {
        return;
    }
    page.header.h1.innerText = activeHabbit.name;
    const percent = percentage(activeHabbit.target, activeHabbit.days);
    page.header.progressPercent.innerText = percent.toFixed(0) + '%';
    page.header.progressBarCover.style.width = (percent.toFixed(0) + '%');
}

function rerenderContent(activeHabbit) {
    page.habbit.habbitDays.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
                            <div class="habbit__descr">
                                <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
                                <button class="habbit__delete" onclick="deleteDays(${index})"><img src="./img/delete.svg" alt=""></button>
                            </div>`
        page.habbit.habbitDays.appendChild(element);
    }
    page.habbit.habbitDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function addDays(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitID) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            }
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    saveData();
    rerender(globalActiveHabbitID);
}

function deleteDays(index) {
    habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitID) {
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
            }
        }
        return habbit;
    });
    saveData();
    rerender(globalActiveHabbitID);
}

function toggleModal() {
    const modal = page.modal.overlay;
    if (modal.classList.contains('overlay-active')) {
        modal.classList.remove('overlay-active');
    } else {
        modal.classList.add('overlay-active');
    }
}

function rerender(activeHabbitID) {
    globalActiveHabbitID = activeHabbitID;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitID);
    if (!activeHabbit) {
        return;
    }
    document.location.replace(document.location.pathname + "#" + activeHabbitID);
    rerenderMenu(activeHabbit);
    renderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

function setIcon(context, icon) {
    page.modal.iconField.value = icon;
    const activeIcon = document.querySelector('.modal__icon.modal__icon-active');
    activeIcon.classList.remove('modal__icon-active');
    context.classList.add('modal__icon-active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxID = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        id: maxID + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    });
    resetForm(event.target, ['name', 'target'])
    toggleModal();
    saveData();
    rerender(maxID + 1);
}

(() => {
    loadData();
    const hashID = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit => habbit.id === hashID);
    if (urlHabbit) {
        rerender(urlHabbit.id);
    } else {
        rerender(habbits[0].id);
    }
})()