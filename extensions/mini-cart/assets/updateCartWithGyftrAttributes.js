/**
 * Updates Shopify cart with GyFTR redemption details
 * @param {Object} redemptionData - The redemption information
 */
async function updateCartWithGyftrAttributes(redemptionData) {

    console.log('Updating cart with GyFTR attributes:', redemptionData);
  try {
    const attributes = {
       "use_GyFTR": 'yes',
      'GyFTR_code': redemptionData.mroNumber || '',
      'GyFTR_amount': redemptionData.amount || '0',
      // 'GyFTR_Mobile_Number': redemptionData.mobile || '',
    //   'GyFTR_Transaction_ID': redemptionData.transactionId || '',
    //   'GyFTR_Reference_Number': redemptionData.referenceNumber || '',
    //   'GyFTR_Balance_Used': redemptionData.balanceUsed || '0',
    //   'GyFTR_Payment_Method': 'GyFTR EPay Wallet'
    };
    
    const response = await fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        attributes: attributes
      })
    });

    console.log('Response from cart update:', response);

    if (!response.ok) {
      throw new Error(`Cart update failed: ${response.status}`);
    }

    const updatedCart = await response.json();
    console.log('Cart updated with GyFTR attributes:', updatedCart);
    return updatedCart;

  } catch (error) {
    console.error('Error updating cart attributes:', error);
    throw error;
  }
}

// Make function available globally
window.updateCartWithGyftrAttributes = updateCartWithGyftrAttributes;