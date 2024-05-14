//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {

  uint256 currentCount = 0;
  struct Product {
    string name;
    uint256 price;
    address payable owner;
    bool purchased;
  }

  Product[] public products;
  mapping(uint256 => bool) public productExists;
  event ProductPurchased(uint256 indexed productId, address indexed buyer);
  
  function increment() public {
      currentCount = currentCount + 1;
  }

  function decrement() public {
      currentCount = currentCount - 1;
  }

  function retrieve() public view returns (uint256){
    return currentCount;
  }

  function createProduct(string memory _name, uint256 _price) external {
    products.push(Product(_name, _price, payable(msg.sender),false));
    productExists[products.length - 1] = true;
  }

  function getProduct(uint256 index) external view returns (string memory, uint256) {
      require(index < products.length, "Index out of bounds");
      return (products[index].name, products[index].price);
  }

  function getProductsCount() external view returns (uint256) {
    return products.length;
  }

  function getAllProducts() external view returns (Product[] memory) {
    return products;
  }

  function purchaseProduct(uint256 productId) external payable {
    require(productId < products.length, "Invalid product ID");
    Product storage product = products[productId];
    require(!product.purchased, "Product already purchased");
    require(msg.value >= product.price, "Insufficient funds");

    product.purchased = true;
    product.owner.transfer(msg.value);

    emit ProductPurchased(productId, msg.sender);
  }

}