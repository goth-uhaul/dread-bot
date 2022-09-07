// Put this in ./config.json (.json! NOT .js!)
// Valid bot components: functionality (always include this!), utility, wiki, bootcamp

const contents = {
	"enabledComponents": ["functionality"], // array of strings, containing enabled bot components
	"owners": [], // array of strings, containing IDs of discord users who can execute owner only commands (i.e. /eval)
	"wikiDomain": "", // wiki URL here (i.e. dreadwiki.hijumpboots.com)
	"contributorRole": "", // ID of wiki contributor role here (for /verify)
	"applicationChannel": "", // ID of channel to send teacher applications to here
	"positions": [
		// array of objects, representing teacher positions. these are in the following format:
		// label: position name, description: description of position (use \u200b to leave empty), value: ID of corresponding teacher role
		{ "label": "", "description": "", "value": "" },
	]
}
