  // // page-reset.js

  // window.resetGyftrModal = function () {
  //   console.log('🔄 Resetting GyFTR modal state');

  //   const modal = document.querySelector('#gyftr-modal');

  //   const step1 = document.querySelector('#gyftr-step-1');
  //   const step2 = document.querySelector('#gyftr-step-2');
  //   const step3 = document.querySelector('#gyftr-step-3');
  //   const step3Left = document.querySelector('.step-3');
  //   const step4 = document.querySelector('#gyftr-step-4');
  //   const step5 = document.querySelector('#gyftr-step-5');

  //   const rightBlock = document.querySelector('.right-block');
  //   const step2summary = document.querySelector('.step-2.summary');
  //   const step4summary = document.querySelector('#gyftr-step-4-summary');
  //   const ordersummaryfinal = document.querySelector('.order-summary-final');


    
  //   const dot1 = document.querySelector('#step-dot-1');
  //   const dot2 = document.querySelector('#step-dot-2');
  //   const dot3 = document.querySelector('#step-dot-3');
  //   const dot4 = document.querySelector('#step-dot-4');

  //   // 🟢 Hide all steps
  //   step2 && (step2.style.display = 'none');
  //   step3 && (step3.style.display = 'none');
  //   step3Left && (step3Left.style.display = 'none');
  //   step4 && (step4.style.display = 'none');
  //   step5 && (step5.style.display = 'none');

  //   // 🟢 Show first step only
  //   step1 && (step1.style.display = 'block');

  //   // 🟢 Reset right block
  //   rightBlock && (rightBlock.style.display = 'none');
  //   step2summary && (step2summary.style.display = 'none');
  //   step4summary && (step4summary.style.display = 'none');
  //   ordersummaryfinal && (ordersummaryfinal.style.display = 'none');

  //   // 🟢 Reset dots
  //   dot1 && dot1.classList.add('active');
  //   dot2 && dot2.classList.remove('active');
  //   dot3 && dot3.classList.remove('active');
  //   dot4 && dot4.classList.remove('active');

    
  //   // 🟢 Clear inputs
  //   document.querySelector('#gyftr-mobile') && (document.querySelector('#gyftr-mobile').value = '');
  //   document.querySelectorAll('.gyftr-otp-box input').forEach(i => i.value = '');
  //   document.querySelector('#gyftr-amount-input') && (document.querySelector('#gyftr-amount-input').value = '');

  //   // 🟢 Clear vouchers
  //   const voucherList = document.querySelector('#voucher-list');
  //   if (voucherList) voucherList.innerHTML = '';

  //   // 🟢 Clear OTP timer
  //   if (window.otpTimerInterval) {
  //     clearInterval(window.otpTimerInterval);
  //     window.otpTimerInterval = null;
  //   }

    
  //   // 🟢 Optional: clear local/session storage if used
  //   sessionStorage.removeItem('GYFTR_STEP');
  //   localStorage.removeItem('GYFTR_SUCCESS');

  //   console.log('✅ GyFTR modal reset done');
  // };



  // page-reset.js - UPDATED VERSION

window.resetGyftrModal = function () {
  console.log('🔄 Resetting GyFTR modal state');

  const modal = document.querySelector('#gyftr-modal');
  
  // LEFT SIDE STEPS
  const step1 = document.querySelector('#gyftr-step-1');
  const step2 = document.querySelector('#gyftr-step-2');
  const step3Left = document.querySelector('.step-3');
  const step4 = document.querySelector('#gyftr-step-4');
  const step5 = document.querySelector('#gyftr-step-5');
  
  // RIGHT SIDE SECTIONS
  const rightBlock = document.querySelector('.right-block');
  const step2Summary = document.querySelector('.step-2.summary');
  const step3Summary = document.querySelector('#gyftr-step-3');
  const step4Summary = document.querySelector('#gyftr-step-4-summary');
  const orderSummaryFinal = document.querySelector('.order-summary-final');
  
  // STEP DOTS
  const dot1 = document.querySelector('#step-dot-1');
  const dot2 = document.querySelector('#step-dot-2');
  const dot3 = document.querySelector('#step-dot-3');
  const dot4 = document.querySelector('#step-dot-4');
  
  // MODAL BOX CLASSES
  const modalBox = document.querySelector('.gyftr-modal-box');
  
  // 🔴 FIX: CRITICAL - Hide the right block completely initially
  if (rightBlock) {
    rightBlock.style.display = 'none';
  }
  
  // 🔴 FIX: Hide all right side sections
  if (step2Summary) step2Summary.style.display = 'none';
  if (step3Summary) step3Summary.style.display = 'none';
  if (step4Summary) step4Summary.style.display = 'none';
  if (orderSummaryFinal) orderSummaryFinal.style.display = 'none';
  
  // 🔴 FIX: Show only step 1 on left side
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  if (step3Left) step3Left.style.display = 'none';
  if (step4) step4.style.display = 'none';
  if (step5) step5.style.display = 'none';
  
  // 🔴 FIX: Reset step dots to initial state (only step 1 active)
  if (dot1) {
    dot1.classList.add('active');
    dot1.querySelector('span').style.backgroundColor = '';
    dot1.querySelector('span').style.color = '';
  }
  
  if (dot2) {
    dot2.classList.remove('active');
    dot2.querySelector('span').style.backgroundColor = '';
    dot2.querySelector('span').style.color = '';
  }
  
  if (dot3) {
    dot3.classList.remove('active');
    dot3.querySelector('span').style.backgroundColor = '';
    dot3.querySelector('span').style.color = '';
  }
  
  if (dot4) {
    dot4.classList.remove('active');
    dot4.querySelector('span').style.backgroundColor = '';
    dot4.querySelector('span').style.color = '';
  }
  
  // 🔴 FIX: Remove modal box classes
  if (modalBox) {
    modalBox.classList.remove('setp-2', 'step-3-active', 'step-4-active');
  }
  
  // Clear all inputs
  const mobileInput = document.querySelector('#gyftr-mobile');
  if (mobileInput) {
    mobileInput.value = '';
    mobileInput.style.borderColor = '';
  }
  
  // Clear mobile error
  const mobileError = document.querySelector('#mobile-error');
  if (mobileError) mobileError.innerHTML = '';
  
  // Clear OTP inputs
  document.querySelectorAll('.gyftr-otp-box input').forEach(input => {
    input.value = '';
  });
  
  // Clear amount input
  const amountInput = document.querySelector('#gyftr-amount-input');
  if (amountInput) {
    amountInput.value = '';
    amountInput.style.borderColor = '';
  }
  
  // Clear amount error
  const amountError = document.querySelector('#amount-error');
  if (amountError) amountError.innerHTML = '';
  
  // Clear voucher input and messages
  const voucherInput = document.querySelector('input[placeholder="GYFTR XXXXXXXXX"]');
  if (voucherInput) voucherInput.value = '';
  
  const voucherMsg = document.querySelector('#voucher-msg span');
  if (voucherMsg) {
    voucherMsg.textContent = '';
    voucherMsg.style.display = 'none';
  }
  
  // Clear OTP error
  const otpErrorBox = document.querySelector('#otp-error-box');
  if (otpErrorBox) {
    otpErrorBox.style.display = 'none';
    otpErrorBox.innerText = '';
  }
  
  // Clear OTP timer
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }
  
  const otpTimer = document.querySelector('#otp-timer');
  if (otpTimer) otpTimer.innerText = '01:00';
  
  const resendBtn = document.querySelector('#resend-otp');
  if (resendBtn) {
    resendBtn.disabled = false;
    resendBtn.style.opacity = '1';
    resendBtn.style.cursor = 'pointer';
  }
  
  // Clear voucher list
  const voucherList = document.querySelector('#voucher-list');
  if (voucherList) voucherList.innerHTML = '';
  
  // Reset mobile text displays
  const mobileText = document.querySelector('#gyftr-mobile-text');
  if (mobileText) mobileText.innerText = '';
  
  const summaryMobile = document.querySelector('#summary-mobile');
  if (summaryMobile) summaryMobile.innerText = '+910987654321';
  
  const summaryMobile3 = document.querySelector('#summary-mobile-3');
  if (summaryMobile3) summaryMobile3.innerText = '';
  
  const summaryMobileStep4 = document.querySelector('#summary-mobile-step4');
  if (summaryMobileStep4) summaryMobileStep4.innerText = '';
  
  // Reset wallet amounts
  const walletAmounts = document.querySelectorAll('#wallet-ammount, #wallet-ammount2, #wallet-ammount4');
  walletAmounts.forEach(el => {
    if (el) el.innerText = '₹5,000';
  });
  
  // Reset redeemed amount
  const redeemedAmount = document.querySelector('#redeemed-amount');
  if (redeemedAmount) redeemedAmount.innerText = '';
  
  // Reset final display
  const finalMobile = document.querySelector('#final-mobile');
  if (finalMobile) finalMobile.innerText = '';
  
  const finalBalance = document.querySelector('#final-balance');
  if (finalBalance) finalBalance.innerText = '₹0';
  
  const referenceNo = document.querySelector('#reference-no');
  if (referenceNo) referenceNo.innerText = '';
  
  // Enable all buttons
  const continueBtn = document.querySelector('#gyftr-continue');
  if (continueBtn) continueBtn.disabled = false;
  
  const continue3Btn = document.querySelector('#gyftr-continue-3');
  if (continue3Btn) {
    continue3Btn.disabled = false;
    continue3Btn.classList.remove('disabled');
  }
  
  const redeemBtn = document.querySelector('#gyftr-redeem-btn');
  if (redeemBtn) {
    redeemBtn.disabled = false;
    const redeemLoader = document.querySelector('#redeem-loader');
    if (redeemLoader) redeemLoader.style.display = 'none';
  }
  
  console.log('✅ GyFTR modal COMPLETELY reset to initial state');
};

window.showVoucherSuccessMessage = function() {
  const msg = document.getElementById('voucher-success-msg');
  if (!msg) return;

  msg.style.display = 'block';

  setTimeout(() => {
    msg.style.display = 'none';
  }, 5500);
}
