function changeVendorCheckbox(target) {
    // Function to hide or display the vendor name input
    // Based on the "is vendor" checkbox in the registration form.
    const vendor_name_input = document.querySelector('#vendor-name');
    if (target.checked == true)
        vendor_name_input.style.display = "block";
    else
        vendor_name_input.style.display = "none";
}


