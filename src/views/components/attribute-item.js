// Within the attributes-section, a list of attributes used by the system is displayed dynamically in a list.
// Each one of them holds the information relevant to a specific attribute.
const template = document.createElement('template');

template.innerHTML = `
<style>
  .att {
    position: relative;
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    box-shadow: var(--box_shadow_light);
    display: flex;
    flex-flow: column nowrap;
    gap: 0.1rem;
  }

  .line {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    gap: 0.2rem;
    align-items: baseline;
    font-weight: bold;
  }

  .name {
    font-size: 1.2rem;
  }

  .mod, .mod-text {
    font-size: 1.1rem;
  }

  .name, .mod-text {
    color: var(--colour_attribute);
    text-shadow: var(--title_shadow);
  }

  text-editor {
    padding-left: 10px;
  }

  img {
    position: absolute;
    width: var(--size_control_button_normal);
    height: var(--size_control_button_normal);
    top: 3px;
    right: 3px;
    cursor: pointer;
  }
</style>

<div class="att">
  <img src="./UI/buttons/Trash 1.png"/>
  <div class="line">
    <editable-field class="name" type="dictionary" placeholder="Attribute Name"></editable-field>
    <span class="mod">[</span>
    <editable-field class="mod-text" type="gameSystem" placeholder="Attribute Mod"></editable-field>
    <span class="mod">]</span>
  </div>
  <text-editor></text-editor>
</div>
`;

class AttributeItem extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$description = this._shadow.querySelector("text-editor");
    this.$name = this._shadow.querySelector(".name");
    this.$mod = this._shadow.querySelector(".mod-text");
    this.$delete = this._shadow.querySelector("img");

    this.$delete.addEventListener('click', _ => {
      // An attribute item can be deleted, and needs to be removed from the game system data.
      this.dispatchEvent(
        new CustomEvent("valueDeleted", {
          bubbles: true,
          composed: true,
          detail: {
            type: "gameSystem",
            target: ["$attributes", "attributes", this.uid]
          }
        })
      );
    });
  }

  static get observedAttributes() {
    return [ "uid", "attribute_data", "user_role", "names" ];
  }

  get attribute_data() { return JSON.parse(this.getAttribute("attribute_data")); }
  get user_role() { return this.getAttribute("user_role"); }
  get names() { return JSON.parse(this.getAttribute("names")); }
  get uid() { return this.getAttribute("uid"); }

  set attribute_data(value) { this.setAttribute("attribute_data", JSON.stringify(value)); }
  set user_role(value) { this.setAttribute("user_role", value); }
  set names(value) { this.setAttribute("names", JSON.stringify(value)); }
  set uid(value) { this.setAttribute("uid", value); }

  attributeChangedCallback(property, oldValue, newValue) {
    // console.log(`AttributeItem.attributeChangedCallback(property: ${property}, oldValue: ${oldValue}, newValue: ${newValue})`);
    if (oldValue === newValue) return;
    switch(property) {
      case "attribute_data":
        this.updateName();
        this.$mod.text = this.attribute_data.mod;
        this.$mod.target = "$attributes.attributes." + this.uid + ".mod";
        this.$description.text = this.attribute_data.description;
        this.$description.type = "attribute-description";
        this.$description.target = "$attributes.attributes." + this.uid + ".description";
      case "user_role":
        this.$description.user_role = this.user_role;
        this.$name.user_role = this.user_role;
        this.$mod.user_role = this.user_role;
        break;
      case "names":
      case "uid":
        this.updateName();
        break;
    }
  }

  updateName() {
    // Names need to be updated only after both the attribute_data and the names dictionary has been populated.
    if (this.names && this.attribute_data && this.uid) {
      this.$name.text = this.names[this.uid];
      this.$name.target = "$names." + this.uid;
    }
  }
}

window.customElements.define('attribute-item', AttributeItem);