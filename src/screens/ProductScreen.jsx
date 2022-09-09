import { gql } from "@apollo/client";
import { PureComponent } from "react";
import { graphql } from "@apollo/client/react/hoc";
import LoadingBox from "../components/LoadingBox";
import "../styles/ProductScreen.css";
import AttributeItem from "../components/AttributeItem";

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
    this.state = {
      image: "",
    };
  }
  setImage = (data) => {
    this.setState({
      image: data,
    });
  };
  setAttribute = (name, item) => {
    let stateObject = {};
    stateObject[name] = item;
    this.setState(stateObject);
    // console.log(this.state);
  };
  render() {
    const { data } = this.props;
    const { error, loading, product } = data;
    const price = product?.prices?.filter(
      (item) => item.currency.label == this.props.activeCurrency.label
    )[0];
    console.log(this.state);
    return loading ? (
      <LoadingBox />
    ) : error ? (
      <div className="error">{error.message}</div>
    ) : (
      <div className="productsreen">
        <div className="gallery">
          <div className="thumbnails">
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
                        activeAttribute={this.state[attribute.name]}
                        index={index}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="label">PRICE:</div>
          <div className="price-productScreen">
            <span>{price.currency.symbol}</span>
            <span>{price.amount}</span>
          </div>
          <button>ADD TO CART</button>
          <div className="description">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
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