import { gql } from "@apollo/client";
import React, { PureComponent } from "react";
import { graphql } from "@apollo/client/react/hoc";
import LoadingBox from "../components/LoadingBox";
import "../styles/ProductScreen.css";
import AttributeItem from "../components/AttributeItem";
import { getPrice } from "../utils";
import DOMPurify from "dompurify";

const GET_PRODUCT = gql`
  query GET_PRODUCT($productId: String!) {
    product(id: $productId) {
      name
      id
      inStock
      gallery
      description
      brand
      category
      attributes {
        name
        id
        type
        items {
          displayValue
          value
          id
        }
      }
      prices {
        currency {
          label
          symbol
        }
        amount
      }
      brand
    }
  }
`;
class ProductScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.descriptionRef = React.createRef();
    this.state = {
      image: "",
      showMessage: false,
      activeAttributes: {},
    };
  }
  setImage = (data) => {
    this.setState({
      image: data,
    });
  };
  setAttribute = (name, item) => {
    this.setState((prevState) => {
      let activeAttributes = Object.assign({}, prevState.activeAttributes);
      activeAttributes[name] = item;
      return { activeAttributes };
    });
  };
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  componentDidUpdate() {
    const html = this.props?.data?.product.description;
    this.descriptionRef.current.innerHTML = DOMPurify.sanitize(html);
  }
  render() {
    const { data } = this.props;
    const { error, loading, product } = data;
    const price = getPrice(product?.prices, this.props?.activeCurrency);

    const activeAttributesLength = Object.getOwnPropertyNames(
      this.state.activeAttributes
    ).length;
    const attributesLength = product?.attributes.length;
    return loading ? (
      <LoadingBox />
    ) : error ? (
      <div className="error">{error.message}</div>
    ) : (
      <div className="productsreen">
        <div className="gallery">
          <div className="thumbnails styled-scrollbar">
            {product?.gallery?.map((item) => (
              <div
                className="thumbnail"
                key={item}
                onClick={() => this.setImage(item)}
              >
                <img src={item} alt="thumbnail" />
              </div>
            ))}
          </div>
          <div className="main-image">
            <img src={this.state.image || product.gallery[0]} alt="product" />
          </div>
        </div>
        <div className="info">
          <div className="brand">{product.brand}</div>
          <div className="product-name">{product.name}</div>
          <div className="attributes">
            {product.attributes?.map((attribute) => (
              <div className="attribute" key={attribute.name}>
                <div className="label">{attribute.name}:</div>
                <div className="attribute-items">
                  {attribute.items?.map((item, index) => {
                    return (
                      <AttributeItem
                        item={item}
                        type={attribute.type}
                        attributeName={attribute.name}
                        setAttribute={this.setAttribute}
                        key={item.id}
                        activeAttribute={
                          this.state.activeAttributes[attribute.name]
                        }
                        index={index}
                        showMessage={this.state.showMessage}
                      />
                    );
                  })}
                </div>
                {this.state.showMessage &&
                  !this.state.activeAttributes[attribute.name] && (
                    <div style={{ color: "red", fontSize: 14, marginTop: 10 }}>
                      Please select "{attribute.name}"
                    </div>
                  )}
              </div>
            ))}
          </div>
          <div className="label">PRICE:</div>
          <div className="price-productScreen">
            <span>{price?.currency.symbol}</span>
            <span>{price?.amount}</span>
          </div>
          <button
            onClick={() =>
              attributesLength === activeAttributesLength
                ? this.props.addToCart(product, this.state.activeAttributes)
                : this.setState({ showMessage: true })
            }
            disabled={!product.inStock}
          >
            {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
          </button>
          <div className="description styled-scrollbar">
            <div ref={this.descriptionRef} />
          </div>
        </div>
      </div>
    );
  }
}
export default graphql(GET_PRODUCT, {
  options: (props) => ({
    variables: {
      productId: window.location.href.split("/")[4],
    },
  }),
})(ProductScreen);
