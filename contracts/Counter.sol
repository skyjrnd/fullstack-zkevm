//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Counter is ERC721, Ownable {

  uint256 currentCount = 0;
  struct Product {
    string name;
    uint256 price;
    address payable owner;
    bool purchased;
  }

  Product[] public products;
  mapping(uint256 => bool) public productExists;

  event ProductCreated(uint256 indexed productId, string name, uint256 price, address owner);
  event ProductPurchased(uint256 indexed productId, address indexed buyer);
  
  constructor() ERC721("Counter", "CNT") Ownable(msg.sender) {
        // Pass the deployer's address to the Ownable constructor
    }

  function increment() public {
      currentCount = currentCount + 1;
  }

  function decrement() public {
      currentCount = currentCount - 1;
  }

  function retrieve() public view returns (uint256){
    return currentCount;
  }

  function createProduct(string memory _name, uint256 _price) external onlyOwner {
    products.push(Product(_name, _price, payable(msg.sender),false));
    uint256 newProductId = products.length - 1;
    _safeMint(msg.sender, newProductId);
    productExists[newProductId] = true;
    emit ProductCreated(newProductId, _name, _price, msg.sender);
  }

  function getProduct(uint256 index) external view returns (string memory, uint256, address payable, bool) {
      require(index < products.length, "Index out of bounds");
      Product memory product = products[index];
      return (product.name, product.price, product.owner, product.purchased);
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