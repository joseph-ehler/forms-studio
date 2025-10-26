# Sheet Stories - Working Foundation

## **Status**: ONE WORKING STORY ✅

---

## **Story 1: BasicToggle** ✅ WORKING

**What it tests:**
- Button opens modal
- Sheet renders with `forceMode="modal"`
- Content displays
- Close button works (presumably)
- ESC works (presumably)

**Key learnings:**
- Sheet MUST be conditionally rendered: `{open && <Sheet>}`
- NOT: `<Sheet open={open}>` (creates invisible blockers)
- Button needs high z-index to prevent blocking

---

## **Next Stories to Add** (one at a time)

### **Story 2: WithSlots**
Test the slot API (Header/Content/Footer)

### **Story 3: MobileSheet** 
Test `forceMode="sheet"` for bottom sheet

### **Story 4: BackdropTest**
Test backdrop variants (dim/blur/none)

### **Story 5: VisualParity**
Desktop vs Mobile comparison

---

## **Pattern That Works:**

```tsx
export const StoryName: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 40, position: 'relative', zIndex: 1 }}>
        <button 
          onClick={() => setOpen(true)}
          style={{ 
            padding: '16px 32px',
            position: 'relative',
            zIndex: 9999,
            cursor: 'pointer',
          }}
        >
          Open
        </button>

        {open && (
          <Sheet
            open={open}
            onOpenChange={setOpen}
            ariaLabel="Title"
            forceMode="modal" // or "sheet"
          >
            <div>Content here</div>
          </Sheet>
        )}
      </div>
    );
  },
};
```

---

## **Don't Do:**
- ❌ `<Sheet open={false}>` (invisible blockers)
- ❌ Always render Sheet (blocks clicks)
- ❌ Complex state management initially
- ❌ 20 stories at once

## **Do:**
- ✅ Conditional render: `{open && <Sheet>}`
- ✅ High z-index on trigger buttons
- ✅ Simple, focused examples
- ✅ One story at a time

---

**Next: Add Story 2 (WithSlots) if you want to continue building stories.**
