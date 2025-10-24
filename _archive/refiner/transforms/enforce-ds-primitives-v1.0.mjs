/**
 * Refiner Transform: Enforce DS Primitives
 * Version: 1.0
 * 
 * Prevents custom input/button styling by requiring DS classes.
 * 
 * Blocks:
 * - <input style={{ border, padding, background }} />
 * - <button style={{ padding, background }} />
 * 
 * Requires:
 * - <input className="ds-input" />
 * - <button className="ds-button" />
 */

export default function enforceDsPrimitives() {
  return {
    name: 'enforce-ds-primitives',
    version: '1.0',
    
    JSXElement(path) {
      const { node } = path;
      const openingElement = node.openingElement;
      const elementName = openingElement.name.name;
      
      // Only check input, button, select, textarea
      const targetElements = ['input', 'button', 'select', 'textarea'];
      if (!targetElements.includes(elementName)) return;
      
      // Check if has className attribute
      const classNameAttr = openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      const hasClassName = classNameAttr && 
        classNameAttr.value && 
        classNameAttr.value.value;
      
      // Check if has style attribute with layout props
      const styleAttr = openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'style'
      );
      
      if (!styleAttr) return;
      
      // Check for layout-related properties in style
      const styleProps = styleAttr.value?.expression?.properties || [];
      const layoutProps = [
        'border', 'borderRadius', 'padding', 'background', 
        'backgroundColor', 'width', 'minHeight', 'fontSize'
      ];
      
      const hasLayoutStyle = styleProps.some(prop => 
        prop.key && layoutProps.includes(prop.key.name || prop.key.value)
      );
      
      if (hasLayoutStyle && !hasClassName) {
        this.report(
          path,
          `<${elementName}> should use DS classes (ds-input, ds-button, etc.) instead of inline layout styles.\n` +
          `   Add: className="ds-${elementName === 'input' || elementName === 'select' || elementName === 'textarea' ? 'input' : elementName}"`
        );
      }
    }
  };
}
