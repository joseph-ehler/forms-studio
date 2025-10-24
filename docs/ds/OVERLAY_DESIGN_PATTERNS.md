# Overlay Design Patterns - God Tier Configurations

**Philosophy:** Every overlay should be delightful, efficient, and accessible. Users should WANT to interact with them.

---

## 1. Layout & Structure Variants

### A. Compact List (Current ✅)
```tsx
// What we have now
- Simple vertical list
- Search at top
- Scrollable options
- Footer actions (optional)
```

**Use Cases:** Simple selects, 5-50 options

### B. Grouped Options
```tsx
<OverlayList>
  <OptionGroup label="North America">
    <Option>United States</Option>
    <Option>Canada</Option>
  </OptionGroup>
  <OptionGroup label="Europe">
    <Option>United Kingdom</Option>
    <Option>Germany</Option>
  </OptionGroup>
</OverlayList>
```

**Features:**
- Sticky group headers
- Collapse/expand groups
- Group-level actions (select all in group)

**Use Cases:** Countries, timezones, categories

### C. Two-Column Layout
```tsx
<OverlayGrid columns={2}>
  <Option icon="🇺🇸">United States</Option>
  <Option icon="🇨🇦">Canada</Option>
</OverlayGrid>
```

**Benefits:**
- More options visible at once
- Better for short labels
- Scannable

**Use Cases:** Languages, currencies, countries with flags

### D. Hierarchical/Nested
```tsx
<Option value="usa" expandable>
  United States
  <SubOptions>
    <Option>California</Option>
    <Option>New York</Option>
  </SubOptions>
</Option>
```

**Interactions:**
- Click to expand/collapse
- Breadcrumb navigation
- Back button
- Or drill-down (show submenu in place)

**Use Cases:** Location (country → state → city), categories, file systems

### E. Grid Layout (Visual Selection)
```tsx
<OverlayGrid columns={6}>
  <ColorOption color="#FF0000" />
  <ColorOption color="#00FF00" />
  <ColorOption color="#0000FF" />
</OverlayGrid>
```

**Use Cases:** Colors, emoji, icons, templates, themes

---

## 2. Search & Filter Patterns

### A. Simple Search (Current ✅)
- Text input at top
- Filters as you type
- Shows match count

### B. Fuzzy Search with Highlighting
```tsx
<Option>
  <Highlight query="ny">New York</Highlight>
</Option>
```

**Features:**
- Typo tolerance
- Highlights matched characters
- Scores by relevance

**Implementation:** Use `fuse.js` or similar

### C. Multi-Field Search
```tsx
// Search by code OR name
"CA" → matches "California" and "Canada (CA)"
```

**Use Cases:** Countries (name/code), products (SKU/name), users (name/email)

### D. Recent + Popular
```tsx
<OverlayList>
  <Section label="Recent">
    <Option>California</Option>
    <Option>New York</Option>
  </Section>
  <Divider />
  <Section label="All States">
    {/* All options */}
  </Section>
</OverlayList>
```

**Features:**
- Recent selections at top
- Popular items highlighted
- "Clear recent" action

### E. Tag-Based Filtering
```tsx
<FilterBar>
  <Chip active>North America</Chip>
  <Chip>Europe</Chip>
  <Chip>Asia</Chip>
</FilterBar>
```

**Use Cases:** Products by category, users by role, files by type

### F. Advanced Filters (Mega Overlay)
```tsx
<OverlaySidebar>
  <FilterPanel>
    <CheckboxGroup label="Type">
      <Checkbox>Image</Checkbox>
      <Checkbox>Video</Checkbox>
    </CheckboxGroup>
    <RangeSlider label="Price" min={0} max={1000} />
    <DateRange label="Created" />
  </FilterPanel>
</OverlaySidebar>
<OverlayContent>
  {/* Filtered results */}
</OverlayContent>
```

**Use Cases:** E-commerce filters, data tables, file browsers

---

## 3. Selection Modes

### A. Single Select (Current ✅)
- Click to select
- Closes immediately

### B. Multi-Select with Checkboxes
```tsx
<Option selected>
  <Checkbox checked />
  California
</Option>
```

**Features:**
- Checkboxes visible
- Stays open after selection
- "Done" button in footer
- Selected count indicator

### C. Multi-Select with Chips (Tags)
```tsx
<SelectTrigger>
  <Chip>California</Chip>
  <Chip>New York</Chip>
  <Chip>Texas</Chip>
</SelectTrigger>
```

**Interactions:**
- Remove chip to deselect
- Limit visible chips (e.g., "+3 more")
- Reorder chips by dragging

### D. Range Selection
```tsx
// Select start and end dates
<Option role="start">Jan 1</Option>
<Option role="end">Jan 31</Option>
// Everything between gets selected
```

**Use Cases:** Date ranges, number ranges, time slots

### E. Hierarchical Selection
```tsx
// Select parent = auto-select all children
// Indeterminate state if only some children selected
```

**Use Cases:** Permissions, categories, folders

---

## 4. Visual Enhancements

### A. Icons & Avatars
```tsx
<Option>
  <Avatar src={user.avatar} />
  <OptionLabel>{user.name}</OptionLabel>
</Option>
```

**Use Cases:** Users, channels, teams

### B. Descriptions/Subtitles
```tsx
<Option>
  <OptionLabel>California</OptionLabel>
  <OptionDescription>United States • 39M people</OptionDescription>
</Option>
```

**Benefits:**
- More context
- Better scannability
- Professional appearance

### C. Badges & Indicators
```tsx
<Option>
  California
  <Badge>Recommended</Badge>
  <Badge variant="new">New</Badge>
</Option>
```

**Use Cases:** Feature flags, status, recommendations

### D. Status Indicators
```tsx
<Option>
  <StatusDot status="online" />
  John Doe
</Option>
```

**Use Cases:** Users (online/offline), servers (healthy/down)

### E. Thumbnails
```tsx
<Option>
  <Thumbnail src={product.image} />
  <OptionLabel>{product.name}</OptionLabel>
</Option>
```

**Use Cases:** Products, templates, themes, media

---

## 5. UX Micro-interactions

### A. Keyboard Shortcuts
```tsx
// Global shortcuts
"/" → Focus search
"Ctrl+K" → Open command palette style
"Esc" → Close overlay

// Within overlay
"↑↓" → Navigate
"Enter" → Select
"Space" → Multi-select toggle
"a" → Select all
"n" → Deselect all
```

**Show hint:** Footer shows available shortcuts

### B. Recent Selections
```tsx
<Section label="Recent" collapsible>
  {recentSelections.map(option => (
    <Option key={option.value} icon={<ClockIcon />}>
      {option.label}
    </Option>
  ))}
</Section>
```

**Features:**
- Persisted to localStorage
- Max 5-10 items
- Clear recent action

### C. Favorites/Pinned
```tsx
<Option>
  California
  <IconButton onClick={toggleFavorite}>
    <StarIcon filled={isFavorite} />
  </IconButton>
</Option>
```

**Features:**
- Click star to favorite
- Favorites section at top
- Sync across sessions

### D. Create New Inline
```tsx
<OverlayFooter>
  <Button onClick={openCreateDialog}>
    <PlusIcon /> Create New Country
  </Button>
</OverlayFooter>

// Or inline in list
<Option special onClick={openCreateDialog}>
  <PlusIcon /> Add new option...
</Option>
```

**Use Cases:** Tags, categories, custom values

### E. Bulk Actions (Multi-Select)
```tsx
<OverlayFooter>
  <Button disabled={!hasSelection}>
    Delete {selectedCount} items
  </Button>
  <Button onClick={selectAll}>Select All</Button>
  <Button onClick={deselectAll}>Clear</Button>
</OverlayFooter>
```

### F. Drag to Reorder (Multi-Select)
```tsx
// After selecting multiple items, drag to reorder
<DraggableOption onDragEnd={handleReorder}>
  California
</DraggableOption>
```

**Visual feedback:**
- Drag handle icon
- Ghost preview while dragging
- Drop indicator line

---

## 6. Smart Features

### A. Async Loading with Virtualization
```tsx
<VirtualList
  itemCount={10000}
  itemSize={44}
  overscan={5}
  loader={<OptionSkeleton />}
>
  {Option}
</VirtualList>
```

**Benefits:**
- Handles 10k+ options smoothly
- Only renders visible items
- Smooth scrolling

**Libraries:** `react-window`, `react-virtual`

### B. Infinite Scroll
```tsx
<OverlayList onScrollEnd={loadMore}>
  {options.map(opt => <Option key={opt.value} />)}
  {loading && <LoadingSpinner />}
</OverlayList>
```

**Use Cases:** Async data (users from API, search results)

### C. Pagination
```tsx
<OverlayFooter>
  <Pagination
    page={currentPage}
    total={totalPages}
    onChange={setPage}
  />
</OverlayFooter>
```

**When:** API requires pagination, very large datasets

### D. Autocomplete Suggestions
```tsx
// As user types, show suggestions
<SearchInput value={query} />
<Suggestions>
  <Suggestion onClick={() => setQuery("California")}>
    California
  </Suggestion>
  <Suggestion onClick={() => setQuery("Canada")}>
    Canada
  </Suggestion>
</Suggestions>
```

### E. "Did You Mean?" Spelling Correction
```tsx
// User types "Califrnia"
<EmptyState>
  No results for "Califrnia"
  <br />
  Did you mean <Link onClick={() => setQuery("California")}>California</Link>?
</EmptyState>
```

### F. Empty States with Actions
```tsx
<EmptyState>
  <EmptyIcon />
  <EmptyTitle>No results for "{query}"</EmptyTitle>
  <EmptyActions>
    <Button onClick={clearSearch}>Clear search</Button>
    <Button onClick={openCreate}>Create "{query}"</Button>
  </EmptyActions>
</EmptyState>
```

### G. Loading Skeletons
```tsx
<OverlayList>
  {loading ? (
    <>
      <OptionSkeleton />
      <OptionSkeleton />
      <OptionSkeleton />
    </>
  ) : (
    options.map(opt => <Option key={opt.value} />)
  )}
</OverlayList>
```

**Better than spinner:** Shows structure while loading

---

## 7. Footer Patterns

### A. Apply/Cancel (Multi-Select)
```tsx
<OverlayFooter>
  <Button variant="ghost" onClick={onCancel}>
    Cancel
  </Button>
  <Button onClick={onApply}>
    Apply {selectedCount} selections
  </Button>
</OverlayFooter>
```

### B. Clear Selection
```tsx
<OverlayFooter>
  <Button onClick={clearSelection} disabled={!hasSelection}>
    Clear
  </Button>
</OverlayFooter>
```

### C. Selected Count Indicator
```tsx
<OverlayFooter>
  <Text muted>{selectedCount} of {total} selected</Text>
</OverlayFooter>
```

### D. Custom Actions
```tsx
<OverlayFooter>
  <Button onClick={importFromCSV}>
    <ImportIcon /> Import CSV
  </Button>
  <Button onClick={exportSelected}>
    <ExportIcon /> Export
  </Button>
</OverlayFooter>
```

---

## 8. Density & Sizing

### A. Compact Density
```css
.ds-option-button--compact {
  min-height: 32px;
  padding: 6px 12px;
  font-size: 13px;
}
```

**Use Cases:** Power users, dense data tables

### B. Comfortable (Current ✅)
```css
.ds-option-button {
  min-height: 44px;
  padding: 10px 16px;
  font-size: 14px;
}
```

**Default:** Good balance

### C. Spacious
```css
.ds-option-button--spacious {
  min-height: 56px;
  padding: 16px 20px;
  font-size: 16px;
}
```

**Use Cases:** Touch-primary interfaces, accessibility

---

## 9. Mobile-Specific Patterns

### A. Bottom Sheet (Current ✅)
- Slides up from bottom
- Drag handle at top
- Swipe down to close

### B. Full-Screen Modal
```tsx
<OverlaySheet fullScreen>
  <Header>
    <BackButton />
    <Title>Select Country</Title>
  </Header>
  <Content>
    {/* Options */}
  </Content>
</OverlaySheet>
```

**When:** Complex selection, many filters

### C. Swipe Gestures
- Swipe item left → Quick action (favorite, delete)
- Pull to refresh → Reload options
- Swipe between sections

### D. Sticky Search
```tsx
// Search bar sticks to top as you scroll
<StickyHeader>
  <SearchInput />
</StickyHeader>
```

---

## 10. Accessibility Enhancements

### A. Keyboard Nav Hints
```tsx
<OverlayFooter>
  <KeyboardHint>
    ↑↓ Navigate • Enter Select • Esc Close
  </KeyboardHint>
</OverlayFooter>
```

### B. Screen Reader Announcements
```tsx
<ScreenReaderOnly aria-live="polite">
  {selectedCount} items selected
</ScreenReaderOnly>

<ScreenReaderOnly aria-live="assertive">
  {filteredCount} results found
</ScreenReaderOnly>
```

### C. Focus Management
- Trap focus within overlay
- Return focus to trigger on close
- Skip links ("Skip to results")

### D. ARIA Attributes
```tsx
<button
  role="option"
  aria-selected={isSelected}
  aria-disabled={isDisabled}
  aria-describedby={`${id}-description`}
>
  {label}
</button>
```

---

## 11. Performance Patterns

### A. Virtual Scrolling
**When:** 1000+ items
**Library:** `react-window` or `react-virtual`
**Trade-off:** Slight complexity for massive performance gain

### B. Debounced Search
```tsx
const debouncedSearch = useDebouncedValue(searchQuery, 300);
```

**Prevents:** Excessive filtering/API calls

### C. Memoization
```tsx
const filteredOptions = useMemo(
  () => options.filter(opt => opt.label.includes(query)),
  [options, query]
);
```

### D. Request Cancellation
```tsx
useEffect(() => {
  const controller = new AbortController();
  
  fetchOptions(query, { signal: controller.signal });
  
  return () => controller.abort();
}, [query]);
```

**Prevents:** Stale results from slow requests

---

## 12. Animation & Transitions

### A. Enter/Exit Animations
```css
.overlay-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.overlay-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease;
}
```

### B. Staggered List Reveal
```tsx
// Items fade in sequentially
<Option style={{ animationDelay: `${index * 50}ms` }} />
```

### C. Selection Feedback
```css
.option-selected {
  animation: pulse 300ms ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

### D. Hover Transitions
```css
.ds-hover-scrim {
  transition: background 150ms ease;
}
```

---

## 13. Advanced Compositions

### A. Command Palette
```tsx
<CommandOverlay>
  <SearchInput placeholder="Type a command..." />
  <CommandGroup label="Actions">
    <Command icon={<SaveIcon />}>Save</Command>
    <Command icon={<ExportIcon />}>Export</Command>
  </CommandGroup>
  <CommandGroup label="Navigation">
    <Command icon={<HomeIcon />}>Go to Home</Command>
  </CommandGroup>
</CommandOverlay>
```

**Features:**
- Fuzzy search commands
- Recent commands
- Keyboard shortcuts shown
- Quick actions

**Examples:** VSCode (Ctrl+Shift+P), Linear (Cmd+K)

### B. Combo Select + Create
```tsx
<ComboBox>
  <SearchInput />
  <OptionList>
    {filteredOptions.map(opt => <Option key={opt.value} />)}
    {searchQuery && !hasExactMatch && (
      <CreateOption onCreate={() => createNew(searchQuery)}>
        Create "{searchQuery}"
      </CreateOption>
    )}
  </OptionList>
</ComboBox>
```

**Use Cases:** Tags, categories, emails (To: field)

### C. Tree Select with Search
```tsx
// Search flattens tree and shows breadcrumbs
<TreeOption expanded>
  USA
  <TreeOption>California</TreeOption>
  <TreeOption>New York</TreeOption>
</TreeOption>

// When searching: "San Francisco"
<FlatOption>
  <Breadcrumb>USA → California → San Francisco</Breadcrumb>
</FlatOption>
```

---

## 14. Theme & Visual Variants

### A. Light/Dark Mode (Auto-Adapt)
```css
.ds-option-button[aria-selected="true"] {
  background: var(--ds-color-primary-bg);
  color: var(--ds-color-primary-text);
}

/* Primary color auto-adapts in dark mode */
```

### B. Glass/Frosted Effect
```css
.ds-overlay--glass {
  background: var(--ds-color-surface-glass);
  backdrop-filter: blur(20px);
}
```

### C. Custom Theming
```tsx
<OverlayList theme={{
  primaryColor: '#FF6B6B',
  borderRadius: '12px',
  spacing: 'spacious'
}} />
```

---

## God Tier Configurations - Specific Use Cases

### 1. Country Selector (Premium)
```tsx
<SelectField>
  <Trigger>
    <Flag country={selected} />
    {selected?.name || "Select country"}
  </Trigger>
  
  <Overlay>
    <SearchInput placeholder="Search countries..." />
    
    <Section label="Recent">
      {recentCountries.map(country => (
        <Option icon={<Flag country={country} />}>
          {country.name}
        </Option>
      ))}
    </Section>
    
    <Divider />
    
    <VirtualList>
      {countries.map(country => (
        <Option 
          icon={<Flag country={country} />}
          description={`${country.code} • ${country.continent}`}
        >
          {country.name}
        </Option>
      ))}
    </VirtualList>
  </Overlay>
</SelectField>
```

**Features:**
- Flag icons
- Recent selections
- Continent in description
- Virtual scrolling (195 countries)
- Fuzzy search

### 2. User/Assignee Picker (Notion/Linear style)
```tsx
<UserSelect>
  <Trigger>
    <AvatarGroup users={selectedUsers} max={3} />
  </Trigger>
  
  <Overlay>
    <SearchInput placeholder="Search team members..." />
    
    <Section label="Suggested">
      <Option>
        <Avatar status="online" />
        <UserInfo>
          <Name>John Doe</Name>
          <Role>Product Manager</Role>
        </UserInfo>
        <Checkbox checked={isSelected} />
      </Option>
    </Section>
    
    <Section label="All Members">
      {/* ... */}
    </Section>
    
    <Footer>
      <Button onClick={inviteNewUser}>
        <PlusIcon /> Invite member
      </Button>
    </Footer>
  </Overlay>
</UserSelect>
```

**Features:**
- Multi-select with checkboxes
- Online status
- Suggested users (recently worked with)
- Invite new inline
- Avatar groups in trigger

### 3. Date Range Picker (Airbnb style)
```tsx
<DateRangePicker>
  <Trigger>
    {startDate?.format('MMM D')} - {endDate?.format('MMM D, YYYY')}
  </Trigger>
  
  <Overlay size="large">
    <TwoColumnLayout>
      <Calendar 
        selected={startDate}
        onSelect={setStartDate}
        highlightRange={[startDate, endDate]}
      />
      <Calendar
        selected={endDate}
        onSelect={setEndDate}
        highlightRange={[startDate, endDate]}
        minDate={startDate}
      />
    </TwoColumnLayout>
    
    <Sidebar>
      <PresetList>
        <Preset onClick={() => selectRange('today')}>
          Today
        </Preset>
        <Preset onClick={() => selectRange('last7days')}>
          Last 7 days
        </Preset>
        <Preset onClick={() => selectRange('thisMonth')}>
          This month
        </Preset>
      </PresetList>
    </Sidebar>
    
    <Footer>
      <Button variant="ghost" onClick={clear}>Clear</Button>
      <Button onClick={apply}>Apply</Button>
    </Footer>
  </Overlay>
</DateRangePicker>
```

**Features:**
- Two calendars side-by-side
- Range highlighting
- Quick presets
- Min/max date validation

### 4. Tag/Label Selector (Gmail style)
```tsx
<TagSelect>
  <Trigger>
    {selectedTags.map(tag => (
      <Chip key={tag.id} color={tag.color} onRemove={() => remove(tag)}>
        {tag.name}
      </Chip>
    ))}
  </Trigger>
  
  <Overlay>
    <SearchInput placeholder="Search or create tags..." />
    
    <OptionList>
      {filteredTags.map(tag => (
        <Option>
          <ColorDot color={tag.color} />
          {tag.name}
          <Checkbox checked={isSelected(tag)} />
        </Option>
      ))}
      
      {searchQuery && !hasExactMatch && (
        <CreateOption onClick={() => createTag(searchQuery)}>
          <PlusIcon /> Create "{searchQuery}"
        </CreateOption>
      )}
    </OptionList>
    
    <Footer>
      <Link onClick={openManageTags}>Manage tags</Link>
    </Footer>
  </Overlay>
</TagSelect>
```

**Features:**
- Multi-select with chips
- Color-coded tags
- Create inline
- Manage tags link

### 5. Emoji Picker (Slack style)
```tsx
<EmojiPicker>
  <Trigger>
    {selectedEmoji || "😀"}
  </Trigger>
  
  <Overlay>
    <SearchInput placeholder="Search emoji..." />
    
    <EmojiCategories>
      <Tab active={category === 'recent'}>🕐 Recent</Tab>
      <Tab active={category === 'smileys'}>😀 Smileys</Tab>
      <Tab active={category === 'people'}>👋 People</Tab>
      {/* ... */}
    </EmojiCategories>
    
    <EmojiGrid columns={8}>
      {emojis.map(emoji => (
        <EmojiButton 
          onClick={() => select(emoji)}
          onHover={showPreview}
        >
          {emoji}
        </EmojiButton>
      ))}
    </EmojiGrid>
    
    <Footer>
      <EmojiPreview>
        {hoveredEmoji?.char}
        <EmojiName>{hoveredEmoji?.name}</EmojiName>
      </EmojiPreview>
    </Footer>
  </Overlay>
</EmojiPicker>
```

**Features:**
- Grid layout
- Category tabs
- Recent emojis
- Hover preview
- Search with keywords

---

## Implementation Priority

### Phase 1: Foundation (✅ Mostly Done)
- [x] Basic overlay positioning
- [x] Search input
- [x] Option list with hover
- [x] Keyboard navigation
- [x] Mobile sheet
- [x] Focus trap

### Phase 2: Essential Features
- [ ] Grouped options
- [ ] Multi-select with checkboxes
- [ ] Recent selections
- [ ] Empty states
- [ ] Loading states
- [ ] Virtual scrolling

### Phase 3: Polish
- [ ] Icons & avatars
- [ ] Descriptions
- [ ] Badges
- [ ] Keyboard shortcuts
- [ ] Animations
- [ ] Fuzzy search

### Phase 4: Advanced
- [ ] Hierarchical options
- [ ] Grid layout
- [ ] Command palette mode
- [ ] Create inline
- [ ] Favorites
- [ ] Custom footers

---

## Design Principles

1. **Progressive Disclosure:** Start simple, reveal complexity only when needed
2. **Keyboard First:** Every action should be keyboard-accessible
3. **Performance:** Virtual scrolling for 1000+ items, debounced search
4. **Accessibility:** WCAG 2.1 AA minimum, AAA preferred
5. **Mobile-Friendly:** Touch targets 44px+, swipe gestures
6. **Delightful:** Smooth animations, helpful empty states, smart suggestions
7. **Composable:** Mix and match patterns, not monolithic components
8. **Themeable:** Respect design tokens, adapt to light/dark mode

---

## Next Steps

**Which pattern(s) should we implement first?**

My recommendations:
1. **Grouped Options** - High value, relatively simple
2. **Multi-Select with Checkboxes** - Common use case
3. **Recent Selections** - Great UX, easy to add
4. **Icons & Descriptions** - Visual polish
5. **Virtual Scrolling** - Performance for large lists

What sounds most exciting to you?
