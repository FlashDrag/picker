export const clearApplyBtnContainer = document.createElement("div");
clearApplyBtnContainer.id = "clearApplyBtnContainer";

export const clearBtn = document.createElement("button");
clearBtn.id = "clearBtn";
clearBtn.innerHTML = "Clear";

export const applyBtn = document.createElement("button");
applyBtn.id = "applyBtn";
applyBtn.innerHTML = "Apply";

clearApplyBtnContainer.appendChild(clearBtn);
clearApplyBtnContainer.appendChild(applyBtn);