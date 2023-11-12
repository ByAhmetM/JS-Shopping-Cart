/* HTML'den gelenler */
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDom = document.querySelector("#products-dom");

let cart = [];
let buttonsDom = [];
class Products {
  async getProducts() {
    try {
      const res = await fetch(
        "https://6550ad7b7d203ab6626e0d01.mockapi.io/products"
      );
      const products = await res.json();
      return products;
    } catch (error) {}
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
        <div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img class="img-fluid" src="${product.image}" alt="" />
              </div>
              <div class="product-hover">
                <span class="product-title">${product.title}</span>
                <span class="product-price">${product.price}₺</span>
                <button class="btn-add-to-cart" data-id=${product.id}>
                  <i class="fas fa-cart-shopping"></i>
                </button>
              </div>
            </div>
          </div>
        `;
    });
    productsDom.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDom = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.setAttribute("disabled", "disabled");
        button.style.opacity = ".3";
      } else {
        button.addEventListener("click", (e) => {
          e.target.disabled = true;
          e.target.style.opacity = ".3";
          //* get product from products
          let cartItem = { ...Storage.getProducts(id), amount: 1 };
          // add product to the cart
          cart = [...cart, cartItem];
          // save cart in local storage
          Storage.saveCart(cart);
          //* save cart values
          this.saveCartValues(cart);
          //* display cart item
          this.addCartItem(cartItem);
          //*show the cart
          this.showCart();
        });
      }
    });
  }

  saveCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2)) + " ₺";
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const li = document.createElement("li");
    li.classList.add("cart-list-item");
    li.innerHTML = `
    <div class="cart-left">
      <div class="cart-left-image">
        <img class="img-fluid" src="${item.image}" />
      </div>
      <div class="cart-left-info">
        <a href="#" class="cart-left-info-title">${item.title}</a>
        <span class="cart-left-info-price">${item.price}₺</span>
      </div>
    </div>
    <div class="cart-right">
      <div class="cart-right-quantity">
        <button class="quantity-minus" data-id=${item.id}>
          <i class="fas fa-minus"></i>
        </button>
        <span class="quantity">${item.amount}</span>
        <button class="quantity-plus" data-id=${item.id}>
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <div class="cart-right-remove">
        <button class="cart-remove-btn" data-id=${item.id}>
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    `;
    cartContent.appendChild(li);
  }

  showCart() {
    cartBtn.click();
  }

  setupAPP() {
    cart = Storage.getCart();
    this.saveCartValues(cart);
    this.populateCart(cart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("cart-remove-btn")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (e.target.classList.contains("quantity-minus")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          lowerAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          lowerAmount.parentElement.parentElement.parentElement.remove();
          this.removeItem(id);
        }
      } else if (e.target.classList.contains("quantity-plus")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.saveCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.style.opacity = "1";
  }

  getSingleButton(id) {
    return buttonsDom.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
