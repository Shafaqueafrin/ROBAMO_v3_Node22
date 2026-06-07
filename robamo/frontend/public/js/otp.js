document.addEventListener("DOMContentLoaded",()=>{

const auth = window.auth;

window.recaptchaVerifier =
new window.RecaptchaVerifier(
auth,
"recaptcha-container",
{
size:"normal"
}
);

const sendBtn =
document.getElementById("sendOtp");

sendBtn.addEventListener(
"click",
async ()=>{

const phone =
document.getElementById("phone").value;

if(!phone){

alert("Enter phone number");

return;

}

try{

const result =
await window.signInWithPhoneNumber(
auth,
phone,
window.recaptchaVerifier
);

window.confirmationResult =
result;

const otp =
prompt("Enter OTP");

if(!otp) return;

await window.confirmationResult.confirm(otp);

alert("Login Success ✅");

}
catch(err){

console.log(err);

alert(err.message);

}

}
);

});