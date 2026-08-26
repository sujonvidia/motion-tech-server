import React, { useEffect, useRef, useCallback, useState } from "react";
import grapesjs from "grapesjs";
import gjsPresetWebpage from "grapesjs-preset-webpage";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import grapesjsPluginForms from "grapesjs-plugin-forms";
import grapesjsPluginExport from "grapesjs-plugin-export";
import { useFormControl, ReactFormInputOptions } from "@vendure/admin-ui/react";

export default function LandingFormInput({ config }: ReactFormInputOptions) {
    const { value, setFormValue } = useFormControl();
    const editorRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!editorContainerRef.current || editorRef.current) return;
    
        // Initialize GrapesJS Editor only once
        editorRef.current = grapesjs.init({
            container: editorContainerRef.current,
            height: "600px",
            storageManager: false,
            plugins: [
                gjsPresetWebpage,
                grapesjsBlocksBasic,
                grapesjsPluginForms,
                grapesjsPluginExport
            ],
            canvas: {
                styles: [
                    "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css",
                    "https://fonts.googleapis.com/css?family=Roboto"
                ]
            },
            styleManager: {
                clearProperties: true,
                sectors: [{
                    name: 'General',
                    buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
                },{
                    name: 'Dimension',
                    open: false,
                    buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding']
                },{
                    name: 'Typography',
                    open: false,
                    buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow']
                },{
                    name: 'Decorations',
                    open: false,
                    buildProps: ['opacity', 'background-color', 'border-radius', 'border', 'box-shadow', 'background']
                },{
                    name: 'Extra',
                    open: false,
                    buildProps: ['transition', 'perspective', 'transform']
                }]
            }
        });
    
        editorRef.current.Panels.addPanel({
            id: 'views',
            buttons: [
                {
                    id: 'open-sm',
                    command: 'open-sm',
                    className: 'fa fa-paint-brush',
                    attributes: { title: 'Open Style Manager' },
                    active: true,
                },
                {
                    id: 'open-tm',
                    command: 'open-tm',
                    className: 'fa fa-cog',
                    attributes: { title: 'Open Settings' },
                },
                {
                    id: 'open-code',
                    command: 'open-code',
                    className: 'fa fa-code',
                    attributes: { title: 'Open Code Editor' },
                },
                {
                    id: 'fullscreen',
                    command: 'o-fullscreen',
                    className: 'fa fa-expand',
                    attributes: { title: 'Toggle Fullscreen' },
                }
            ]
        });
    
        // Ensure Style Manager is opened by default
        editorRef.current.Commands.run('open-sm');
    
        // Load saved content into editor
        if (value) {
            editorRef.current.setComponents(value);
        }
    
        // Listen for changes and update form
        editorRef.current.on("component:update", () => {
            setFormValue(editorRef.current.getHtml());
        });
    
        return () => {
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, []);

    // Load GrapesJS CSS
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/grapesjs/dist/css/grapes.min.css";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const saveContent = useCallback(() => {
        if (editorRef.current) {
            const html = editorRef.current.getHtml();
            const css = editorRef.current.getCss();
            
            // Combine HTML and CSS
            const fullContent = `
                <style>${css}</style>
                ${html}
            `;
            
            setFormValue(fullContent);
            console.log("Saved Content:", fullContent);
        }
    }, [setFormValue]);

    const toggleFullscreen = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(err => {
                console.error('Fullscreen failed', err);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const [productSlug, setProductSlug] = useState<string>('');
    const [loadingSlug, setLoadingSlug] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('coffee');
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const fetchProductSlug = async (productId: string) => {
        setLoadingSlug(true);
        try {
            const res = await fetch('/admin-api', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query GetProductSlug($id: ID!) {
                            product(id: $id) {
                                slug
                            }
                        }
                    `,
                    variables: { id: productId },
                }),
            });
            const json = await res.json();
            if (json.data?.product?.slug) {
                setProductSlug(json.data.product.slug);
            }
        } catch (e) {
            console.error('Failed to fetch product slug', e);
        } finally {
            setLoadingSlug(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const pathname = window.location.pathname;
        const match = pathname.match(/\/admin\/catalog\/products\/(\d+)/);
        if (match) {
            fetchProductSlug(match[1]);
        }
    }, []);

    const getLandingPageUrl = () => {
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            const match = pathname.match(/\/admin\/catalog\/products\/(\d+)/);
            if (match) {
                const id = match[1];
                if (productSlug) {
                    return `http://localhost:3001/offer/${productSlug}`;
                }
                return `http://localhost:3001/offer/product-${id}`;
            }
        }
        return 'http://localhost:3001/offer/your-product-slug';
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getLandingPageUrl());
    };

    const templates: Record<string, { html: string; css: string }> = {
        coffee: {
            html: `
                <section class="hero" style="position:relative;padding:0;margin:0;background:#111;">
                    <div style="position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop') center/cover no-repeat;opacity:.35;"></div>
                    <div style="position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:120px 20px 100px;color:#fff;text-align:center;">
                        <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;margin:0 0 18px;">Premium Coffee,<br>Roasted for Real Moments</h1>
                        <p style="font-size:1.1rem;opacity:.9;max-width:640px;margin:0 auto 28px;">Ethically sourced beans, small-batch roasted. From our roastery to your morning ritual.</p>
                        <a href="#order" style="display:inline-block;padding:14px 26px;background:#c69c6d;color:#111;font-weight:600;border-radius:6px;text-decoration:none;">Order Now</a>
                    </div>
                </section>
                <section style="max-width:1100px;margin:0 auto;padding:60px 20px;">
                    <h2 style="text-align:center;font-size:2rem;margin-bottom:30px;">Why Coffee Lovers Choose Us</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;">
                        <div style="padding:24px;border:1px solid #e5e5e5;border-radius:12px;">
                            <h3 style="margin:0 0 10px;">☕ Fresh Roasted</h3>
                            <p style="margin:0;color:#555;">Roasted in small batches within 24 hours of shipping.</p>
                        </div>
                        <div style="padding:24px;border:1px solid #e5e5e5;border-radius:12px;">
                            <h3 style="margin:0 0 10px;">🌿 Ethically Sourced</h3>
                            <p style="margin:0;color:#555;">Direct trade from farms that care for people and planet.</p>
                        </div>
                        <div style="padding:24px;border:1px solid #e5e5e5;border-radius:12px;">
                            <h3 style="margin:0 0 10px;">🚚 Fast Delivery</h3>
                            <p style="margin:0;color:#555;">Delivered to your door with temperature-safe packaging.</p>
                        </div>
                    </div>
                </section>
                <section id="order" style="background:#f7f7f7;padding:60px 20px;">
                    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;align-items:center;">
                        <div>
                            <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800&auto=format&fit=crop" alt="Coffee" style="width:100%;border-radius:12px;">
                        </div>
                        <div>
                            <h2 style="font-size:2rem;margin:0 0 12px;">Mark Coffe</h2>
                            <p style="color:#555;margin:0 0 18px;">Rich body, smooth finish, and balanced brightness. Perfect for espresso or pour-over.</p>
                            <ul style="margin:0 0 20px;padding-left:18px;color:#444;">
                                <li>Single-origin Arabica beans</li>
                                <li>Tasting notes: chocolate & caramel</li>
                                <li>Roast level: Medium-dark</li>
                                <li>Weight: 250g / 500g / 1kg</li>
                            </ul>
                            <a href="/checkout" style="display:inline-block;padding:14px 22px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Buy Now</a>
                        </div>
                    </div>
                </section>
                <section style="max-width:1100px;margin:0 auto;padding:60px 20px;">
                    <h2 style="text-align:center;font-size:2rem;margin-bottom:20px;">What Our Customers Say</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
                        <blockquote style="margin:0;padding:20px;border-left:4px solid #c69c6d;background:#fff;border-radius:0 12px 12px 0;">"Best morning coffee I've had this year."</blockquote>
                        <blockquote style="margin:0;padding:20px;border-left:4px solid #c69c6d;background:#fff;border-radius:0 12px 12px 0;">"Packaging is premium and delivery was fast."</blockquote>
                        <blockquote style="margin:0;padding:20px;border-left:4px solid #c69c6d;background:#fff;border-radius:0 12px 12px 0;">"I can finally taste the origin notes."</blockquote>
                    </div>
                </section>
            `,
            css: `
                .hero { color: #fff; }
                section > div > h2 { letter-spacing: 0.3px; }
                ul li { margin-bottom: 6px; }
            `,
        },
        nightlight: {
            html: `
                <section style="position:relative;padding:0;margin:0;overflow:hidden;">
                    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 35%,rgba(255,214,120,.8) 0,rgba(255,239,190,.48) 36%,rgba(255,244,214,.12) 74%);opacity:.95;"></div>
                    <div style="position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:120px 20px 100px;color:#2b2118;text-align:center;">
                        <p style="margin:0 0 14px;color:#f6c978;font-size:.82rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Soft light. Better nights.</p>
                        <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;margin:0 0 18px;color:#2b2118;">A warmer way<br>to wind down</h1>
                        <p style="font-size:1.1rem;color:#4b3828;opacity:1;max-width:640px;margin:0 auto 28px;">A gentle bedside glow that makes late-night reading, feeds, and quiet moments feel more comfortable.</p>
                        <a href="#order" style="display:inline-block;padding:14px 26px;background:#f6c978;color:#241a10;font-weight:700;border-radius:6px;text-decoration:none;">Bring Home the Glow</a>
                    </div>
                </section>
                <section style="max-width:1100px;margin:0 auto;padding:60px 20px;">
                    <h2 style="text-align:center;font-size:2rem;margin:0 0 30px;color:#241a10;">Made for your evening routine</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;">
                        <div style="padding:24px;border:1px solid #eadfce;border-radius:12px;background:#fffaf2;">
                            <h3 style="margin:0 0 10px;color:#241a10;">Gentle brightness</h3>
                            <p style="margin:0;color:#665b50;">A warm, diffused glow that feels easy on tired eyes.</p>
                        </div>
                        <div style="padding:24px;border:1px solid #eadfce;border-radius:12px;background:#fffaf2;">
                            <h3 style="margin:0 0 10px;color:#241a10;">Simple dimming</h3>
                            <p style="margin:0;color:#665b50;">Set the mood with smooth brightness control at your fingertips.</p>
                        </div>
                        <div style="padding:24px;border:1px solid #eadfce;border-radius:12px;background:#fffaf2;">
                            <h3 style="margin:0 0 10px;color:#241a10;">All-night comfort</h3>
                            <p style="margin:0;color:#665b50;">A compact, dependable companion for bedrooms and nurseries.</p>
                        </div>
                    </div>
                </section>
                <section id="order" style="background:#f4efe7;padding:60px 20px;">
                    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;align-items:center;">
                        <div style="min-height:320px;border-radius:12px;background:radial-gradient(circle at 50% 42%,#ffe7a8 0,#d49b4d 12%,#34261c 34%,#111827 72%);box-shadow:0 18px 45px rgba(36,26,16,.2);"></div>
                        <div>
                            <h2 style="font-size:2rem;margin:0 0 12px;color:#241a10;">Nightlight</h2>
                            <p style="color:#665b50;margin:0 0 18px;">Turn any corner into a calm pocket of light, without waking the whole room.</p>
                            <ul style="margin:0 0 20px;padding-left:18px;color:#4b4036;">
                                <li>Warm, eye-friendly ambient light</li>
                                <li>Adjustable brightness for every moment</li>
                                <li>Low-profile design for bedside tables</li>
                                <li>Quiet, energy-efficient operation</li>
                            </ul>
                            <a href="/checkout" style="display:inline-block;padding:14px 22px;background:#241a10;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Shop Nightlight</a>
                        </div>
                    </div>
                </section>
                <section style="max-width:1100px;margin:0 auto;padding:60px 20px;text-align:center;">
                    <h2 style="font-size:2rem;margin:0 0 20px;color:#241a10;">A little light goes a long way</h2>
                    <p style="max-width:640px;margin:0 auto;color:#665b50;">From bedtime stories to midnight water breaks, keep the atmosphere calm and the path visible.</p>
                </section>
            `,
            css: `
                section { font-family: Arial, sans-serif; }
                ul li { margin-bottom: 6px; }
            `,
        },
        simple: {
            html: `
                <section style="max-width:900px;margin:0 auto;padding:60px 20px;text-align:center;">
                    <h1 style="font-size:2.4rem;margin-bottom:16px;">Simple Product Offer</h1>
                    <p style="color:#555;max-width:640px;margin:0 auto 24px;">Clean layout with a clear headline, short description, and a single call to action.</p>
                    <a href="/checkout" style="display:inline-block;padding:14px 24px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Buy Now</a>
                </section>
            `,
            css: `
                section { font-family: Arial, sans-serif; }
            `,
        },
        checkout_split: {
            html: `
                <section style="max-width:1100px;margin:0 auto;padding:60px 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;">
                    <div>
                        <h2 style="margin:0 0 12px;">Product Title</h2>
                        <p style="color:#555;">Short benefit-driven description and key product details.</p>
                        <a href="/checkout" style="display:inline-block;margin-top:18px;padding:14px 22px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Proceed to Checkout</a>
                    </div>
                    <div style="background:#f7f7f7;padding:20px;border-radius:12px;">
                        <h3 style="margin:0 0 12px;">Order Summary</h3>
                        <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #e5e5e5;"><span>Subtotal</span><span>0.00</span></div>
                        <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #e5e5e5;"><span>Shipping</span><span>0.00</span></div>
                        <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;font-weight:700;"><span>Total</span><span>0.00</span></div>
                        <a href="/checkout" style="display:block;margin-top:14px;padding:14px;background:#c69c6d;color:#111;font-weight:600;border-radius:6px;text-align:center;text-decoration:none;">Checkout</a>
                    </div>
                </section>
            `,
            css: `
                section > div > h2 { letter-spacing: 0.3px; }
            `,
        },
    };

    const loadTemplate = useCallback(() => {
        if (!editorRef.current) return;
        const template = templates[selectedTemplate];
        if (!template) return;
        editorRef.current.setComponents(template.html);
        editorRef.current.setStyle(template.css);
        setFormValue(`<style>${template.css}</style>${template.html}`);
    }, [selectedTemplate, setFormValue]);

    return (
        <div 
            ref={wrapperRef}
            style={{ 
                display: "flex", 
                flexDirection: "column", 
                height: isFullscreen ? '100vh' : "auto",
                position: isFullscreen ? 'fixed' : 'relative',
                inset: isFullscreen ? 0 : 'auto',
                zIndex: isFullscreen ? 9999 : 'auto',
                background: '#fff'
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select 
                        value={selectedTemplate} 
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                        <option value="coffee">Coffee Template</option>
                        <option value="nightlight">Nightlight Template</option>
                        <option value="simple">Simple Template</option>
                        <option value="checkout_split">Checkout Split Template</option>
                    </select>
                    <button onClick={loadTemplate} style={{ padding: "8px 16px", background: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Load Template
                    </button>
                </div>
                <div style={{ marginBottom: "10px", padding: "10px", background: "#f0f0f0", borderRadius: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>Landing Page URL:</span>
                <input 
                    type="text" 
                    value={getLandingPageUrl()} 
                    readOnly 
                    style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
                />
                <button onClick={copyToClipboard} style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Copy
                </button>
            </div>
        </div>

            <div style={{ display: "flex", height: "600px" }}>
                {/* Left Panel */}
                <div className="panel__left" style={{ width: "250px", background: "#f5f5f5", overflow: "auto" }}></div>

                {/* Editor Canvas */}
                <div ref={editorContainerRef} style={{ flex: 1, height: "100%", overflow: "auto" }}></div>

                {/* Right Panel */}
                <div className="panel__right" style={{ width: "250px", background: "#f5f5f5", overflow: "auto" }}></div>
            </div>

            {/* Block Manager Panel */}
            <div id="blocks" style={{ background: "#eaeaea", padding: "10px", minHeight: "100px" }}></div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={saveContent} style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Save Page
                </button>
                <button onClick={toggleFullscreen} style={{ padding: "10px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Full screen
                </button>
            </div>
        </div>
    );
}
