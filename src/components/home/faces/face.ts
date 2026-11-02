// A typeface for the homepage, with what the big name needs to sit right in
// it. Each face lives in its own module so a page only loads (and preloads)
// the one it uses.
export type Face = {
	label: string
	// Sets the sans for the homepage
	className: string
	// Letter spacing for the name. Display sizes want it tighter than text,
	// and how much depends on the face's spacing.
	tracking: string
	// The name's first letter has a side bearing that grows with its size;
	// pulling it back by this much lines it up with the small text under it.
	bearing: string
}

export const faceStyle = (face: Face) =>
	({
		'--name-tracking': face.tracking,
		'--name-bearing': face.bearing,
	}) as React.CSSProperties
