// Методы, которые могут пригодиться:
// starWars.searchCharacters(query), 
// starWars.searchPlanets(query), 
// starWars.searchSpecies(query).
// starWars.getCharactersById(id), 
// starWars.getPlanetsById(id), 
// starWars.getSpeciesById(id)

// Тут ваш код.
//Первая строка
const byQueryBlock = document.getElementById("byQueryBlock");
const byQuerySelect = byQueryBlock.querySelector("select");
const byQueryInput = byQueryBlock.querySelector("input");
const submitByQueryButton = document.getElementById("byQueryBtn");
//Вторая строка
const byIdBlock = document.getElementById("byIdBlock");
const byIdSelect = byIdBlock.querySelector("select");
const byIdInput = byIdBlock.querySelector("input");
const submitByIdButton = document.getElementById("byIdBtn");

//Спиннер
const spinner = document.querySelector(".spinner");
const showSpinner = () => spinner.style.visibility = "visible";
const hideSpinner = () => spinner.style.visibility = "hidden";

//вывод модульного окна с ответом
const contentElement = document.getElementById("content");
const resultContainer = document.getElementById("result-container");
const hideContentButton = document.querySelector(".delete");
const setContent = content => contentElement.innerHTML = content;
const showContentBlock = () => resultContainer.style.visibility = "visible";
const hideContentBlock = () => resultContainer.style.visibility = "hidden";

submitByQueryButton.addEventListener("click", () => handleSubmitClick("byQuery", byQuerySelect.value, byQueryInput.value));
submitByIdButton.addEventListener("click", () => handleSubmitClick("byId", byIdSelect.value, byIdInput.value));
hideContentButton.addEventListener("click", () => hideContentBlock());

// показвывать спинер при клике на btnSearch и модальное окно
const handleSubmitClick = async (param, option, value) => {
  showSpinner();
  const content = await fetchContent(param, option, value);
  const serializeContent = param === "byQuery" ? await contentSerializer(content) : await oneEntityContentSerializer(content);
  setContent(serializeContent);
  showContentBlock();
  hideSpinner();
};

const fetchContent = async (param, option, value) => {
  if (param === "byId") {
    switch(option){
      case "planets": return await starWars.getPlanetsById(value);
      case "species": return await starWars.getSpeciesById(value);
      default: return await starWars.getCharactersById(value);
    }
  }

  switch(option){
    case "planets": return await starWars.searchPlanets(value);
    case "species": return await starWars.searchSpecies(value);
    default: return await starWars.searchCharacters(value);
  }
};

const _getElement = (tag, text) => `<${tag}>${text}</${tag}>`;
const _getUnorderedList = text => _getElement("ul", text);
const _getListItem = text => _getElement("li", text);
const _getElementList = values => _getUnorderedList(values.reduce((acc, value) => `${acc}${_getListItem(value)}`, ""));

const _normalizeValue = (value) => {
  if (!value || !value.length) return "";
  if (Array.isArray(value) && value.length) return _getElementList(value);
  return value;
};

const _fetchHomeWorldName = async (link) => {
  if (!link || !link.length) return link;
  const url = new URL(link);
  const id = url.pathname.split("/")[3];
  const { name } = await starWars.getPlanetsById(id);
  return name;
};

const _getExtendedValue = async (key, value) => {
  switch (key) {
    case "homeworld": return await _fetchHomeWorldName(value);
    default: return value;
  }
};

const contentSerializer = async ({ results }) => {
  let content = "";
  for await (const oneEntityData of results) {
    content += `${await oneEntityContentSerializer(oneEntityData)}<br />`;
  };
  return content;
};

const oneEntityContentSerializer = async (data) => {
  let oneEntityContent = "";
  const formattedData = Object.entries(data);
  for await (const [key, value] of formattedData) {
    const extendedValue = _normalizeValue(await _getExtendedValue(key, value));
    const extendedData = _getListItem(`${key}: ${extendedValue}`);
    oneEntityContent += extendedData;
  }
  return _getUnorderedList(oneEntityContent);
};