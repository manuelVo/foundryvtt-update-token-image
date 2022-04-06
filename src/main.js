import { libWrapper } from "./libwrapper_shim.js";

Hooks.once("init", () => {
	libWrapper.register("update-token-image", "FilePicker.prototype._renderInner", renderInner, "WRAPPER");
	libWrapper.register("update-token-image", "ActorSheet.prototype._onEditImage", onEditImage, "OVERRIDE");
	libWrapper.register("update-token-image", "ActorSheet.prototype._updateObject", updateObject, "WRAPPER");
});


async function renderInner(wrapped, data) {
	const options = this.options;
	const html = await wrapped(data);
	if (options.updateTokenImageEnable) {
		html.find("footer > button").before(`<div class="form-group"><input type="checkbox" id="update-token-image" name="update-token-image"/><label for="update-token-image">${game.i18n.localize("update-token-image.updateTokenImage")}</label></div>`);
		html.find("#update-token-image").prop("checked", options.updateTokenImageChecked);
		html.find("#update-token-image").change(function () {options.updateTokenImageChecked = $(this).prop("checked");});
	}
	return html;
}


function onEditImage(event) {
	const attr = event.currentTarget.dataset.edit;
	const current = getProperty(this.actor.data, attr);
	const updateTokenImageChecked = !this.object.data.token.randomImg && this.object.data.img === this.object.data.token.img;
	const fp = new FilePicker({
		type: "image",
		current: current,
		callback: (path, picker) => {
			event.currentTarget.src = path;
			event.updateTokenImageChecked = picker.options.updateTokenImageChecked;
			this._onSubmit(event);
		},
		top: this.position.top + 40,
		left: this.position.left + 10,
		updateTokenImageEnable: true,
		updateTokenImageChecked: updateTokenImageChecked,
	});
	return fp.browse();
}

async function updateObject(wrapped, event, formData) {
	if ( !this.object.id )
		return;
	const result = await wrapped(event, formData);
	if (event.updateTokenImageChecked)
		await this.object.update({token: {img: formData.img}});
	return result;
}
