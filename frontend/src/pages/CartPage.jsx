import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
const CartPage = () => {
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { cart, updatingId, updateCartItem, removeFromCart, cartLoading } =
    useCart();
  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      await updateCartItem(productId, quantity);
    } catch (error) {
      console.error("Quantity Update Error:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Remove Cart Item Error:", error);
    }
  };
  return (
    <>
      <Header />

      <div
        id="shopify-section-template--23597514817819__cart-items"
        className="site-section"
      >
        <div className="cart-main-wrapper">
          <div className="container container--medium">
            <div className="page-header">
              <div className="page-header__text-wrapper text-container">
                <h1 className="heading h2">Your cart</h1>
                <ap-freeshippingbar
                  threshold="1000.0"
                  className="shipping-bar shipping-bar--large"
                  style={{ "--progress": "0" }}
                >
                  <span
                    style={{ fontFamily: '"manrope"', fontWeight: "600" }}
                    className="shipping-bar__text"
                  >
                    Spend $1,000.00 more and get free shipping!
                  </span>
                  <span className="shipping-bar__progress"> </span>
                </ap-freeshippingbar>
              </div>
            </div>
            <div className="page-content page-content--fluid">
              <form className="cart" id="form_cart">
                <input type="hidden" name="checkout" />
                <div className="cart__content">
                  <table className="cart-table table table--loose">
                    <thead className="cart-table-header hide-on-phone">
                      <tr>
                        <th>
                          <span className="heading heading--xsmall text--subdued">
                            Products
                          </span>
                        </th>
                        <th style={{ paddingLeft: "32px" }}>
                          <span className="heading heading--xsmall text--subdued text--center">
                            Quantity
                          </span>
                        </th>
                        <th style={{ textAlign: "right" }}>
                          <span className="heading heading--xsmall text--subdued text--right">
                            Total
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="cart-table-body">
                      {cart.items.map((item) => {
                        const product = item.product;
                        const productImage = product?.image
                          ? `http://localhost:5000${product.image}`
                          : "";

                        return (
                          <tr className="cart-item" key={item.cart_item_id}>
                            <td className="cart-item-product">
                              <div className="cart-item-content-wrapper">
                                <Link
                                  to={`/products/${item.product_id}`}
                                  className="cart-item-image-wrapper"
                                  tabIndex="-1"
                                  aria-hidden="true"
                                >
                                  <img
                                    src={productImage}
                                    className="cart-item-image"
                                    alt={product?.title || "Product"}
                                    loading="lazy"
                                    width="150"
                                    height="210"
                                  />
                                </Link>

                                <div className="cart-item-info">
                                  <div className="product-card-meta">
                                    <Link
                                      to={`/products/${item.product_id}`}
                                      className="product-card-title text--small hide-on-tablet-up"
                                    >
                                      {product?.title}
                                    </Link>

                                   

                                    <div className="product-card-property-list">
                                      <div style={{ lineHeight: "0" }}>
                                        <span className="product-card-property text--subdued text--xsmall">
                                          {product?.author
                                            ? `Author: ${product.author}`
                                            : ""}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="product-option">
                                      ₹{Number(item.price).toFixed(2)}
                                    </div>

                                    <ul
                                      className="discounts list-unstyled"
                                      role="list"
                                      aria-label="Discount"
                                    ></ul>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="cart-item-quantity cart-item-quantity--block text--center">
                              <line-item-quantity>
                                <div className="quantity-selector quantity-selector--small">
                                  <button
                                    type="button"
                                    className="quantity-selector-button"
                                    aria-label="Decrease quantity"
                                    disabled={updatingId === item.product_id}
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.product_id,
                                        item.quantity - 1,
                                      )
                                    }
                                  >
                                    <svg
                                      focusable="false"
                                      width="8"
                                      height="2"
                                      className="icon icon--minus"
                                      viewBox="0 0 8 2"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M0 0h8v2H0z"
                                      ></path>
                                    </svg>
                                  </button>

                                  <input
                                    className="quantity-selector-input text--xsmall"
                                    type="text"
                                    value={item.quantity}
                                    size="2"
                                    aria-label="Change quantity"
                                    readOnly
                                  />

                                  <button
                                    type="button"
                                    className="quantity-selector-button"
                                    aria-label="Increase quantity"
                                    disabled={updatingId === item.product_id}
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.product_id,
                                        item.quantity + 1,
                                      )
                                    }
                                  >
                                    <svg
                                      focusable="false"
                                      width="8"
                                      height="8"
                                      className="icon icon--plus"
                                      viewBox="0 0 8 8"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M3 5v3h2V5h3V3H5V0H3v3H0v2h3z"
                                        fill="currentColor"
                                      ></path>
                                    </svg>
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  className="cart-item-remove-button link text--subdued text--xxsmall"
                                  disabled={updatingId === item.product_id}
                                  onClick={() => handleRemove(item.product_id)}
                                >
                                  Remove
                                </button>
                              </line-item-quantity>
                            </td>
                            <td className="cart-item-price-container text--right">
                              <span className="price price--end">
                                ₹{Number(item.subtotal).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        id="shopify-section-template--23597514817819__cart-footer"
        className="site-section cart__footer-wrapper"
      >
        <div className="page-width is-empty" id="main-cart-footer">
          <div className="container container--medium">
            <div className="cart__footer">
              <div className="cart__footer-left">
                <ap-elementopen
                  id="mini-ap-cartnote"
                  className="mini-cart__order-note"
                >
                  <span className="openable__overlay"> </span>
                  <label
                    htmlFor="cart[note]"
                    className="mini-cart__order-note-title heading heading--xsmall"
                  >
                    Add Note
                  </label>
                  <textarea
                    is="ap-cartnote"
                    name="note"
                    id="cart[note]"
                    rows="3"
                    className="input__field input__field--textarea"
                    placeholder="Add Note"
                  ></textarea>
                  <button
                    type="button"
                    data-action="close"
                    className="d-none form__submit form__submit--closer button button--secondary"
                  >
                    Save
                  </button>
                </ap-elementopen>
                <div className="shipping-cart">
                  <label htmlFor="Cart-note">Get shipping estimates</label>
                  <ap-contentcollapsible id="ap-shippingestimator">
                    <ap-shippingestimator
                      className="shipping-estimator-form"
                      role="form"
                    >
                      <div className="input-row">
                        <div className="input">
                          <label
                            className="input__block-label"
                            htmlFor="ap-shippingestimator[country]"
                          >
                            Country
                          </label>
                          <div className="select-wrapper is-filled">
                            <select
                              className="select"
                              is="ap-localizationselector"
                              name="ap-shippingestimator[country]"
                              id="ap-shippingestimator[country]"
                              ap-ariaowns="ap-shippingestimator-province-wrapper"
                              data-default=""
                            >
                              <option value="---" data-provinces="[]">
                                ---
                              </option>
                              <option
                                value="Australia"
                                data-provinces='[["Australian Capital Territory","Australian Capital Territory"],["New South Wales","New South Wales"],["Northern Territory","Northern Territory"],["Queensland","Queensland"],["South Australia","South Australia"],["Tasmania","Tasmania"],["Victoria","Victoria"],["Western Australia","Western Australia"]]'
                              >
                                Australia
                              </option>
                              <option value="Austria" data-provinces="[]">
                                Austria
                              </option>
                              <option value="Belgium" data-provinces="[]">
                                Belgium
                              </option>
                              <option
                                value="Canada"
                                data-provinces='[["Alberta","Alberta"],["British Columbia","British Columbia"],["Manitoba","Manitoba"],["New Brunswick","New Brunswick"],["Newfoundland and Labrador","Newfoundland and Labrador"],["Northwest Territories","Northwest Territories"],["Nova Scotia","Nova Scotia"],["Nunavut","Nunavut"],["Ontario","Ontario"],["Prince Edward Island","Prince Edward Island"],["Quebec","Quebec"],["Saskatchewan","Saskatchewan"],["Yukon","Yukon"]]'
                              >
                                Canada
                              </option>
                              <option
                                value="Czech Republic"
                                data-provinces="[]"
                              >
                                Czechia
                              </option>
                              <option value="Denmark" data-provinces="[]">
                                Denmark
                              </option>
                              <option value="Finland" data-provinces="[]">
                                Finland
                              </option>
                              <option value="France" data-provinces="[]">
                                France
                              </option>
                              <option value="Germany" data-provinces="[]">
                                Germany
                              </option>
                              <option
                                value="Hong Kong"
                                data-provinces='[["Hong Kong Island","Hong Kong Island"],["Kowloon","Kowloon"],["New Territories","New Territories"]]'
                              >
                                Hong Kong SAR
                              </option>
                              <option
                                value="Ireland"
                                data-provinces='[["Carlow","Carlow"],["Cavan","Cavan"],["Clare","Clare"],["Cork","Cork"],["Donegal","Donegal"],["Dublin","Dublin"],["Galway","Galway"],["Kerry","Kerry"],["Kildare","Kildare"],["Kilkenny","Kilkenny"],["Laois","Laois"],["Leitrim","Leitrim"],["Limerick","Limerick"],["Longford","Longford"],["Louth","Louth"],["Mayo","Mayo"],["Meath","Meath"],["Monaghan","Monaghan"],["Offaly","Offaly"],["Roscommon","Roscommon"],["Sligo","Sligo"],["Tipperary","Tipperary"],["Waterford","Waterford"],["Westmeath","Westmeath"],["Wexford","Wexford"],["Wicklow","Wicklow"]]'
                              >
                                Ireland
                              </option>
                              <option value="Israel" data-provinces="[]">
                                Israel
                              </option>
                              <option
                                value="Italy"
                                data-provinces={`[["Agrigento","Agrigento"],["Alessandria","Alessandria"],["Ancona","Ancona"],["Aosta","Aosta Valley"],["Arezzo","Arezzo"],["Ascoli Piceno","Ascoli Piceno"],["Asti","Asti"],["Avellino","Avellino"],["Bari","Bari"],["Barletta-Andria-Trani","Barletta-Andria-Trani"],["Belluno","Belluno"],["Benevento","Benevento"],["Bergamo","Bergamo"],["Biella","Biella"],["Bologna","Bologna"],["Bolzano","South Tyrol"],["Brescia","Brescia"],["Brindisi","Brindisi"],["Cagliari","Cagliari"],["Caltanissetta","Caltanissetta"],["Campobasso","Campobasso"],["Carbonia-Iglesias","Carbonia-Iglesias"],["Caserta","Caserta"],["Catania","Catania"],["Catanzaro","Catanzaro"],["Chieti","Chieti"],["Como","Como"],["Cosenza","Cosenza"],["Cremona","Cremona"],["Crotone","Crotone"],["Cuneo","Cuneo"],["Enna","Enna"],["Fermo","Fermo"],["Ferrara","Ferrara"],["Firenze","Florence"],["Foggia","Foggia"],["Forlì-Cesena","Forlì-Cesena"],["Frosinone","Frosinone"],["Genova","Genoa"],["Gorizia","Gorizia"],["Grosseto","Grosseto"],["Imperia","Imperia"],["Isernia","Isernia"],["L'Aquila","L’Aquila"],["La Spezia","La Spezia"],["Latina","Latina"],["Lecce","Lecce"],["Lecco","Lecco"],["Livorno","Livorno"],["Lodi","Lodi"],["Lucca","Lucca"],["Macerata","Macerata"],["Mantova","Mantua"],["Massa-Carrara","Massa and Carrara"],["Matera","Matera"],["Medio Campidano","Medio Campidano"],["Messina","Messina"],["Milano","Milan"],["Modena","Modena"],["Monza e Brianza","Monza and Brianza"],["Napoli","Naples"],["Novara","Novara"],["Nuoro","Nuoro"],["Ogliastra","Ogliastra"],["Olbia-Tempio","Olbia-Tempio"],["Oristano","Oristano"],["Padova","Padua"],["Palermo","Palermo"],["Parma","Parma"],["Pavia","Pavia"],["Perugia","Perugia"],["Pesaro e Urbino","Pesaro and Urbino"],["Pescara","Pescara"],["Piacenza","Piacenza"],["Pisa","Pisa"],["Pistoia","Pistoia"],["Pordenone","Pordenone"],["Potenza","Potenza"],["Prato","Prato"],["Ragusa","Ragusa"],["Ravenna","Ravenna"],["Reggio Calabria","Reggio Calabria"],["Reggio Emilia","Reggio Emilia"],["Rieti","Rieti"],["Rimini","Rimini"],["Roma","Rome"],["Rovigo","Rovigo"],["Salerno","Salerno"],["Sassari","Sassari"],["Savona","Savona"],["Siena","Siena"],["Siracusa","Syracuse"],["Sondrio","Sondrio"],["Taranto","Taranto"],["Teramo","Teramo"],["Terni","Terni"],["Torino","Turin"],["Trapani","Trapani"],["Trento","Trentino"],["Treviso","Treviso"],["Trieste","Trieste"],["Udine","Udine"],["Varese","Varese"],["Venezia","Venice"],["Verbano-Cusio-Ossola","Verbano-Cusio-Ossola"],["Vercelli","Vercelli"],["Verona","Verona"],["Vibo Valentia","Vibo Valentia"],["Vicenza","Vicenza"],["Viterbo","Viterbo"]]`}
                              >
                                Italy
                              </option>
                              <option
                                value="Japan"
                                data-provinces='[["Aichi","Aichi"],["Akita","Akita"],["Aomori","Aomori"],["Chiba","Chiba"],["Ehime","Ehime"],["Fukui","Fukui"],["Fukuoka","Fukuoka"],["Fukushima","Fukushima"],["Gifu","Gifu"],["Gunma","Gunma"],["Hiroshima","Hiroshima"],["Hokkaidō","Hokkaido"],["Hyōgo","Hyogo"],["Ibaraki","Ibaraki"],["Ishikawa","Ishikawa"],["Iwate","Iwate"],["Kagawa","Kagawa"],["Kagoshima","Kagoshima"],["Kanagawa","Kanagawa"],["Kumamoto","Kumamoto"],["Kyōto","Kyoto"],["Kōchi","Kochi"],["Mie","Mie"],["Miyagi","Miyagi"],["Miyazaki","Miyazaki"],["Nagano","Nagano"],["Nagasaki","Nagasaki"],["Nara","Nara"],["Niigata","Niigata"],["Okayama","Okayama"],["Okinawa","Okinawa"],["Saga","Saga"],["Saitama","Saitama"],["Shiga","Shiga"],["Shimane","Shimane"],["Shizuoka","Shizuoka"],["Tochigi","Tochigi"],["Tokushima","Tokushima"],["Tottori","Tottori"],["Toyama","Toyama"],["Tōkyō","Tokyo"],["Wakayama","Wakayama"],["Yamagata","Yamagata"],["Yamaguchi","Yamaguchi"],["Yamanashi","Yamanashi"],["Ōita","Oita"],["Ōsaka","Osaka"]]'
                              >
                                Japan
                              </option>
                              <option
                                value="Malaysia"
                                data-provinces='[["Johor","Johor"],["Kedah","Kedah"],["Kelantan","Kelantan"],["Kuala Lumpur","Kuala Lumpur"],["Labuan","Labuan"],["Melaka","Malacca"],["Negeri Sembilan","Negeri Sembilan"],["Pahang","Pahang"],["Penang","Penang"],["Perak","Perak"],["Perlis","Perlis"],["Putrajaya","Putrajaya"],["Sabah","Sabah"],["Sarawak","Sarawak"],["Selangor","Selangor"],["Terengganu","Terengganu"]]'
                              >
                                Malaysia
                              </option>
                              <option value="Netherlands" data-provinces="[]">
                                Netherlands
                              </option>
                              <option
                                value="New Zealand"
                                data-provinces={`'["Auckland","Auckland"],["Bay of Plenty","Bay of Plenty"],["Canterbury","Canterbury"],["Chatham Islands","Chatham Islands"],["Gisborne","Gisborne"],["Hawke's Bay"],["Hawke’s Bay"],["Manawatu-Wanganui","Manawatū-Whanganui"],["Marlborough","Marlborough"],["Nelson","Nelson"],["Northland","Northland"],["Otago","Otago"],["Southland","Southland"],["Taranaki","Taranaki"],["Tasman","Tasman"],["Waikato","Waikato"],["Wellington","Wellington"],["West Coast","West Coast"]'`}
                              >
                                New Zealand
                              </option>
                              <option value="Norway" data-provinces="[]">
                                Norway
                              </option>
                              <option value="Poland" data-provinces="[]">
                                Poland
                              </option>
                              <option
                                value="Portugal"
                                data-provinces='[["Aveiro","Aveiro"],["Açores","Azores"],["Beja","Beja"],["Braga","Braga"],["Bragança","Bragança"],["Castelo Branco","Castelo Branco"],["Coimbra","Coimbra"],["Faro","Faro"],["Guarda","Guarda"],["Leiria","Leiria"],["Lisboa","Lisbon"],["Madeira","Madeira"],["Portalegre","Portalegre"],["Porto","Porto"],["Santarém","Santarém"],["Setúbal","Setúbal"],["Viana do Castelo","Viana do Castelo"],["Vila Real","Vila Real"],["Viseu","Viseu"],["Évora","Évora"]]'
                              >
                                Portugal
                              </option>
                              <option value="Singapore" data-provinces="[]">
                                Singapore
                              </option>
                              <option
                                value="South Korea"
                                data-provinces='[["Busan","Busan"],["Chungbuk","North Chungcheong"],["Chungnam","South Chungcheong"],["Daegu","Daegu"],["Daejeon","Daejeon"],["Gangwon","Gangwon"],["Gwangju","Gwangju City"],["Gyeongbuk","North Gyeongsang"],["Gyeonggi","Gyeonggi"],["Gyeongnam","South Gyeongsang"],["Incheon","Incheon"],["Jeju","Jeju"],["Jeonbuk","North Jeolla"],["Jeonnam","South Jeolla"],["Sejong","Sejong"],["Seoul","Seoul"],["Ulsan","Ulsan"]]'
                              >
                                South Korea
                              </option>
                              <option
                                value="Spain"
                                data-provinces='[["A Coruña","A Coruña"],["Albacete","Albacete"],["Alicante","Alicante"],["Almería","Almería"],["Asturias","Asturias Province"],["Badajoz","Badajoz"],["Balears","Balears Province"],["Barcelona","Barcelona"],["Burgos","Burgos"],["Cantabria","Cantabria Province"],["Castellón","Castellón"],["Ceuta","Ceuta"],["Ciudad Real","Ciudad Real"],["Cuenca","Cuenca"],["Cáceres","Cáceres"],["Cádiz","Cádiz"],["Córdoba","Córdoba"],["Girona","Girona"],["Granada","Granada"],["Guadalajara","Guadalajara"],["Guipúzcoa","Gipuzkoa"],["Huelva","Huelva"],["Huesca","Huesca"],["Jaén","Jaén"],["La Rioja","La Rioja Province"],["Las Palmas","Las Palmas"],["León","León"],["Lleida","Lleida"],["Lugo","Lugo"],["Madrid","Madrid Province"],["Melilla","Melilla"],["Murcia","Murcia"],["Málaga","Málaga"],["Navarra","Navarra"],["Ourense","Ourense"],["Palencia","Palencia"],["Pontevedra","Pontevedra"],["Salamanca","Salamanca"],["Santa Cruz de Tenerife","Santa Cruz de Tenerife"],["Segovia","Segovia"],["Sevilla","Seville"],["Soria","Soria"],["Tarragona","Tarragona"],["Teruel","Teruel"],["Toledo","Toledo"],["Valencia","Valencia"],["Valladolid","Valladolid"],["Vizcaya","Biscay"],["Zamora","Zamora"],["Zaragoza","Zaragoza"],["Álava","Álava"],["Ávila","Ávila"]]'
                              >
                                Spain
                              </option>
                              <option value="Sweden" data-provinces="[]">
                                Sweden
                              </option>
                              <option value="Switzerland" data-provinces="[]">
                                Switzerland
                              </option>
                              <option
                                value="United Arab Emirates"
                                data-provinces='[["Abu Dhabi","Abu Dhabi"],["Ajman","Ajman"],["Dubai","Dubai"],["Fujairah","Fujairah"],["Ras al-Khaimah","Ras al-Khaimah"],["Sharjah","Sharjah"],["Umm al-Quwain","Umm al-Quwain"]]'
                              >
                                United Arab Emirates
                              </option>
                              <option
                                value="United Kingdom"
                                data-provinces='[["British Forces","British Forces"],["England","England"],["Northern Ireland","Northern Ireland"],["Scotland","Scotland"],["Wales","Wales"]]'
                              >
                                United Kingdom
                              </option>
                              <option
                                value="United States"
                                data-provinces='[["Alabama","Alabama"],["Alaska","Alaska"],["American Samoa","American Samoa"],["Arizona","Arizona"],["Arkansas","Arkansas"],["Armed Forces Americas","Armed Forces Americas"],["Armed Forces Europe","Armed Forces Europe"],["Armed Forces Pacific","Armed Forces Pacific"],["California","California"],["Colorado","Colorado"],["Connecticut","Connecticut"],["Delaware","Delaware"],["District of Columbia","Washington DC"],["Federated States of Micronesia","Micronesia"],["Florida","Florida"],["Georgia","Georgia"],["Guam","Guam"],["Hawaii","Hawaii"],["Idaho","Idaho"],["Illinois","Illinois"],["Indiana","Indiana"],["Iowa","Iowa"],["Kansas","Kansas"],["Kentucky","Kentucky"],["Louisiana","Louisiana"],["Maine","Maine"],["Marshall Islands","Marshall Islands"],["Maryland","Maryland"],["Massachusetts","Massachusetts"],["Michigan","Michigan"],["Minnesota","Minnesota"],["Mississippi","Mississippi"],["Missouri","Missouri"],["Montana","Montana"],["Nebraska","Nebraska"],["Nevada","Nevada"],["New Hampshire","New Hampshire"],["New Jersey","New Jersey"],["New Mexico","New Mexico"],["New York","New York"],["North Carolina","North Carolina"],["North Dakota","North Dakota"],["Northern Mariana Islands","Northern Mariana Islands"],["Ohio","Ohio"],["Oklahoma","Oklahoma"],["Oregon","Oregon"],["Palau","Palau"],["Pennsylvania","Pennsylvania"],["Puerto Rico","Puerto Rico"],["Rhode Island","Rhode Island"],["South Carolina","South Carolina"],["South Dakota","South Dakota"],["Tennessee","Tennessee"],["Texas","Texas"],["Utah","Utah"],["Vermont","Vermont"],["Virgin Islands","U.S. Virgin Islands"],["Virginia","Virginia"],["Washington","Washington"],["West Virginia","West Virginia"],["Wisconsin","Wisconsin"],["Wyoming","Wyoming"]]'
                              >
                                United States
                              </option>
                              <option value="Vietnam" data-provinces="[]">
                                Vietnam
                              </option>
                            </select>
                            <svg
                              focusable="false"
                              width="12"
                              height="8"
                              className="icon icon--chevron"
                              viewBox="0 0 12 8"
                            >
                              <path
                                fill="none"
                                d="M1 1l5 5 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                              ></path>
                            </svg>
                          </div>
                        </div>

                        <div
                          id="ap-shippingestimator-province-wrapper"
                          className="input"
                          hidden
                        >
                          <label
                            className="input__block-label"
                            htmlFor="ap-shippingestimator[province]"
                          >
                            Province
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="select"
                              name="ap-shippingestimator[province]"
                              id="ap-shippingestimator[province]"
                            ></select>
                            <svg
                              focusable="false"
                              width="12"
                              height="8"
                              className="icon icon--chevron"
                              viewBox="0 0 12 8"
                            >
                              <path
                                fill="none"
                                d="M1 1l5 5 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div className="input">
                          <label
                            className="input__block-label"
                            htmlFor="ap-shippingestimator[zip]"
                          >
                            Zip code
                          </label>
                          <input
                            type="text"
                            className="input__field"
                            name="ap-shippingestimator[zip]"
                            id="ap-shippingestimator[zip]"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        is="loader-button"
                        className="form__submit form__submit--closer button button--primary"
                      >
                        <span className="loader-button-text">
                          <span className="loader-button-text">Estimate</span>
                          <span className="loader-button-spinner" hidden>
                            <div className="spinner">
                              <svg
                                focusable="false"
                                width="24"
                                height="24"
                                className="icon icon--spinner"
                                viewBox="25 25 50 50"
                              >
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="5"
                                ></circle>
                              </svg>
                            </div>
                          </span>
                        </span>
                        <span className="loader-button-spinner" hidden>
                          <div className="spinner">
                            <svg
                              focusable="false"
                              width="25"
                              height="25"
                              className="icon icon--spinner"
                              viewBox="25 25 50 50"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                            </svg>
                          </div>
                        </span>
                      </button>
                    </ap-shippingestimator>
                  </ap-contentcollapsible>
                </div>
              </div>
              <div className="cart__footer-right">
                <div className="cart__recap">
                  <div className="cart__recap-block">
                    <div className="cart__total-container">
                      <span className="heading h6">Subtotal</span>
                      <span className="heading h6">
                        ₹{Number(cart.totalAmount).toFixed(2)} USD
                      </span>
                    </div>
                    <small
                      style={{ fontFamily: '"manrope"', fontWeight: "600" }}
                      className="tax-note caption-large rte"
                    >
                      Taxes and shipping calculated at checkout
                    </small>
                  </div>
                  <div>
                    <p className="terms_conditions">
                      <input
                        style={{ float: "none", verticalAlign: "middle" }}
                        type="checkbox"
                        className="agree-terms-conditions"
                        id="agree_terms_conditions"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <label
                        style={{
                          display: "inline",
                          float: "none",
                          fontFamily: '"manrope"',
                          fontWeight: "600",
                        }}
                        htmlFor="agree_terms_conditions"
                      >
                        I agree with the <a href="#">terms and conditions</a>
                      </label>
                    </p>
                    <Link
                      id="bt_checkout"
                      to="/checkouts"
                      className="cart__checkout-button checkout-button button button--primary button--full"
                      onClick={(e) => {
                        if (!agreeTerms) {
                          e.preventDefault();
                          return;
                        }
                      }}
                      style={{
                        opacity: agreeTerms ? "1" : "0.5",
                        cursor: agreeTerms ? "pointer" : "not-allowed",
                      }}
                    >
                      Checkout
                    </Link>
                  </div>
                </div>

                <div className="cart__payment-methods">
                  <span className="cart__payment-methods-label text--xsmall text--subdued">
                    We accept
                  </span>
                  <div className="payment-methods-list--center">
                    <img
                      src="//ap-bokifa.myshopify.com/cdn/shop/files/pay.png?v=1729758744&width=400"
                      width="auto"
                      height="auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default CartPage;
