const addParticipantBtn = document.getElementById('addParticipantBtn');
const participantInpWrapper = document.getElementById('participantInpWrapper');

const mainForm = document.getElementById('mainForm');

addParticipantBtn.addEventListener('click', () => {
    
    if (participantInpWrapper.children[0].value) {
        const participantInp = document.createElement('input');
        participantInp.setAttribute('type', 'text');
        participantInp.setAttribute('name', 'participants[]');
        participantInp.setAttribute('class', 'form-control');
        participantInp.setAttribute('placeholder', 'Name');
        participantInpWrapper.prepend(participantInp);
    }

});

mainForm.addEventListener('submit', (e) => {
    console.log('Form Data:', new FormData(mainForm));
});