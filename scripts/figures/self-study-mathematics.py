# Regenerates the figures of content/posts/self-study-mathematics.mdx (needs numpy and matplotlib).
import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle
from matplotlib import colors
from math import factorial

import os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'media', 'blog', 'self-study-mathematics') + os.sep
BG, INK, ACC, GREY, LIGHT, WARM = '#fbfaf8', '#272b33', '#2f5fb3', '#8d93a0', '#d9dce2', '#b5562f'
plt.rcParams.update({
    'figure.facecolor': BG, 'axes.facecolor': BG, 'savefig.facecolor': BG,
    'axes.edgecolor': GREY, 'axes.labelcolor': INK, 'xtick.color': GREY, 'ytick.color': GREY,
    'text.color': INK, 'font.size': 11, 'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'path', 'lines.linewidth': 1.6,
})


def save(fig, name, png=False):
    fig.tight_layout()
    fig.savefig(OUT + name + ('.png' if png else '.svg'), dpi=200 if png else None)
    plt.close(fig)


def through_origin(ax):
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')


def arrow(ax, p, q, color=ACC, size=13):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle='-|>', mutation_scale=size, color=color, lw=0))


# 1. Riemann sums
f = lambda x: 0.6 + np.sin(1.3 * x) * 0.5 + 0.08 * x * x
fig, axs = plt.subplots(1, 3, figsize=(9, 2.8), sharey=True)
xs = np.linspace(0, 3, 400)
for ax, n in zip(axs, [4, 8, 32]):
    e = np.linspace(0, 3, n + 1)
    mids = (e[:-1] + e[1:]) / 2
    ax.bar(e[:-1], f(mids), width=3 / n, align='edge', color=LIGHT, edgecolor=GREY, linewidth=0.6)
    ax.plot(xs, f(xs), color=ACC)
    ax.set_title(f'{n} rectangles', fontsize=11)
    ax.set_xticks([]); ax.set_yticks([])
save(fig, 'riemann-sums')

# 2. Taylor polynomials of sin
fig, ax = plt.subplots(figsize=(9, 3.4))
x = np.linspace(-2 * np.pi, 2 * np.pi, 800)
ax.plot(x, np.sin(x), color=INK, lw=2.4)
for deg, a in zip([1, 3, 5, 7, 9], [0.3, 0.45, 0.6, 0.75, 0.95]):
    p = sum((-1) ** k * x ** (2 * k + 1) / factorial(2 * k + 1) for k in range((deg + 1) // 2))
    ax.plot(x, p, color=ACC, alpha=a, lw=1.2)
ax.text(-6.2, 1.55, 'sin x and its Taylor polynomials of degree 1, 3, 5, 7, 9', fontsize=10)
ax.set_ylim(-2, 2)
through_origin(ax)
ax.set_xticks([-2 * np.pi, -np.pi, np.pi, 2 * np.pi], ['-2π', '-π', 'π', '2π'])
ax.set_yticks([])
save(fig, 'taylor-sin')

# 3. Linear map: circle to ellipse, singular vectors
A = np.array([[1.6, 0.7], [0.4, 0.9]])
U, S, Vt = np.linalg.svd(A)
t = np.linspace(0, 2 * np.pi, 300)
c = np.stack([np.cos(t), np.sin(t)])
fig, axs = plt.subplots(1, 2, figsize=(8, 3.6))
for ax in axs:
    ax.set_aspect('equal'); ax.axis('off'); ax.set_xlim(-2.1, 2.1); ax.set_ylim(-1.6, 1.6)
axs[0].plot(*c, color=INK)
axs[1].plot(*(A @ c), color=INK)
for i in range(2):
    arrow(axs[0], (0, 0), tuple(Vt[i]))
    axs[0].plot([0, Vt[i][0]], [0, Vt[i][1]], color=ACC, lw=1.4)
    u = U[:, i] * S[i]
    arrow(axs[1], (0, 0), tuple(u))
    axs[1].plot([0, u[0]], [0, u[1]], color=ACC, lw=1.4)
axs[0].set_title('unit circle, right singular vectors', fontsize=10)
axs[1].set_title('image under A, stretched by σ₁ and σ₂', fontsize=10)
fig.add_artist(FancyArrowPatch((0.47, 0.45), (0.53, 0.45), transform=fig.transFigure,
                               arrowstyle='-|>', mutation_scale=14, color=GREY))
fig.text(0.5, 0.5, 'A', ha='center', fontsize=14, color=GREY)
save(fig, 'linear-map-svd')

# 4. epsilon-delta
g = lambda x: 0.5 + 0.35 * x + 0.25 * np.sin(2.2 * x)
a, eps = 1.2, 0.35
fa = g(a)
d = 0.0
for dd in np.linspace(0.001, 1, 2000):
    w = np.linspace(a - dd, a + dd, 200)
    if np.all(np.abs(g(w) - fa) < eps):
        d = dd
    else:
        break
fig, ax = plt.subplots(figsize=(7.5, 3.6))
xs = np.linspace(-0.2, 2.6, 400)
ax.axhspan(fa - eps, fa + eps, color=ACC, alpha=0.10, lw=0)
for yy in (fa - eps, fa + eps):
    ax.axhline(yy, color=ACC, lw=0.8, ls='--')
ax.axvspan(a - d, a + d, color=INK, alpha=0.07, lw=0)
for xx in (a - d, a + d):
    ax.axvline(xx, color=INK, lw=0.8, ls=':')
w = np.linspace(a - d, a + d, 100)
ax.plot(w, g(w), color=ACC, lw=5, alpha=0.35, solid_capstyle='round')
ax.plot(xs, g(xs), color=INK)
ax.plot([a], [fa], 'o', color=INK, ms=5)
ax.text(2.65, fa + eps, 'f(a) + ε', va='center', fontsize=10, color=ACC)
ax.text(2.65, fa - eps, 'f(a) − ε', va='center', fontsize=10, color=ACC)
for xx, lab in ((a - d, 'a − δ'), (a, 'a'), (a + d, 'a + δ')):
    ax.text(xx, -0.08, lab, ha='center', va='top', fontsize=10)
ax.set_xticks([]); ax.set_yticks([]); ax.set_xlim(-0.2, 3.3); ax.set_ylim(-0.3, 1.8)
save(fig, 'epsilon-delta')

# 5. x^n converges pointwise, not uniformly
fig, ax = plt.subplots(figsize=(7.5, 3.4))
x = np.linspace(0, 1, 600)
for n, al in zip([1, 2, 4, 8, 16, 32, 64], np.linspace(0.25, 1, 7)):
    ax.plot(x, x ** n, color=ACC, alpha=al, lw=1.3)
ax.plot([0, 1], [0, 0], color=INK, lw=2.4)
ax.plot([1], [1], 'o', color=INK, ms=5)
ax.plot([1], [0], 'o', mfc=BG, mec=INK, ms=5)
ax.text(0.03, 0.06, 'the limit: 0, then a jump to 1 at x = 1', fontsize=10)
ax.text(0.22, 0.55, 'xⁿ for n = 1, 2, 4, …, 64', color=ACC, fontsize=10)
ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
save(fig, 'pointwise-limit')

# 6. Pendulum phase portrait
th, om = np.meshgrid(np.linspace(-3 * np.pi, 3 * np.pi, 60), np.linspace(-3, 3, 30))
fig, ax = plt.subplots(figsize=(9, 3.4))
ax.streamplot(th, om, om, -np.sin(th), color=GREY, density=1.1, linewidth=0.7, arrowsize=0.8)
tt = np.linspace(-3 * np.pi, 3 * np.pi, 800)
sep = 2 * np.abs(np.cos(tt / 2))
ax.plot(tt, sep, color=ACC, lw=1.6)
ax.plot(tt, -sep, color=ACC, lw=1.6)
for k in (-2, 0, 2):
    ax.plot(k * np.pi, 0, 'o', color=INK, ms=4)
for k in (-3, -1, 1, 3):
    ax.plot(k * np.pi, 0, 'o', mfc=BG, mec=INK, ms=5)
ax.set_xticks([-2 * np.pi, 0, 2 * np.pi], ['-2π', '0', '2π']); ax.set_yticks([])
ax.set_xlabel('angle'); ax.set_ylabel('angular velocity')
ax.set_xlim(-3 * np.pi, 3 * np.pi); ax.set_ylim(-3, 3)
save(fig, 'pendulum-phase-portrait')

# 7. Central limit theorem: density of the mean of n uniforms
fig, axs = plt.subplots(1, 4, figsize=(9, 2.4), sharey=True)
h = 0.002
for ax, n in zip(axs, [1, 2, 4, 16]):
    dens = np.ones(int(1 / h))
    for _ in range(n - 1):
        dens = np.convolve(dens, np.ones(int(1 / h))) * h
    xs = np.arange(len(dens)) * h / n
    dens = dens * n
    xs, dens = xs[::max(1, len(xs) // 300)], dens[::max(1, len(dens) // 300)]
    ax.fill_between(xs, dens, color=ACC, alpha=0.18, lw=0)
    ax.plot(xs, dens, color=ACC)
    if n > 1:
        s = np.sqrt(1 / 12 / n)
        ax.plot(xs, np.exp(-(xs - 0.5) ** 2 / (2 * s * s)) / (s * np.sqrt(2 * np.pi)), color=INK, lw=0.9, ls='--')
    ax.set_title(f'mean of {n}', fontsize=11); ax.set_xticks([0, 1]); ax.set_yticks([])
save(fig, 'central-limit')

# 8. Indented semicircle contour for sin(x)/x
fig, ax = plt.subplots(figsize=(7.5, 3.4))
R, r = 3, 0.5
t = np.linspace(0, np.pi, 300)
ax.plot(R * np.cos(t), R * np.sin(t), color=ACC)
arrow(ax, (R * np.cos(0.5), R * np.sin(0.5)), (R * np.cos(0.56), R * np.sin(0.56)))
ax.plot([r, R], [0, 0], color=ACC); ax.plot([-R, -r], [0, 0], color=ACC)
arrow(ax, (1.6, 0), (1.75, 0)); arrow(ax, (-1.9, 0), (-1.75, 0))
t2 = np.linspace(np.pi, 0, 100)
ax.plot(r * np.cos(t2), r * np.sin(t2), color=ACC)
arrow(ax, (r * np.cos(1.65), r * np.sin(1.65)), (r * np.cos(1.45), r * np.sin(1.45)))
ax.axhline(0, color=GREY, lw=0.6, zorder=0); ax.axvline(0, color=GREY, lw=0.6, zorder=0)
ax.plot([0], [0], 'x', color=INK, ms=8, mew=1.6)
ax.text(2.25, 2.3, 'R', fontsize=11, color=ACC); ax.text(0.28, 0.5, 'r', fontsize=11, color=ACC)
ax.text(0.12, -0.4, 'pole at 0', fontsize=10)
ax.set_aspect('equal'); ax.axis('off'); ax.set_xlim(-3.6, 3.6); ax.set_ylim(-0.7, 3.3)
save(fig, 'contour-sinc')

# 9. Logistic map bifurcation diagram
rs = np.linspace(2.6, 4.0, 2400)
x = 0.5 * np.ones_like(rs)
for _ in range(600):
    x = rs * x * (1 - x)
pr, px = [], []
for _ in range(250):
    x = rs * x * (1 - x)
    pr.append(rs.copy()); px.append(x.copy())
fig, ax = plt.subplots(figsize=(9, 3.6))
ax.plot(np.concatenate(pr), np.concatenate(px), ',', color=INK, alpha=0.25)
ax.set_xlabel('r'); ax.set_ylabel('long-run values of x'); ax.set_xlim(2.6, 4); ax.set_yticks([0, 1])
save(fig, 'logistic-bifurcation', png=True)

# 10. Gibbs phenomenon
x = np.linspace(-np.pi, np.pi, 2000)
fig, ax = plt.subplots(figsize=(9, 3.2))
ax.plot(x, np.sign(np.sin(x)), color=INK, lw=2)
for N, al in zip([1, 3, 9, 41], [0.3, 0.5, 0.75, 1]):
    s = sum(4 / np.pi * np.sin(k * x) / k for k in range(1, N + 1, 2))
    ax.plot(x, s, color=ACC, alpha=al, lw=1.1)
ax.annotate('overshoot of about 9%, whatever N is', xy=(0.08, 1.18), xytext=(0.8, 1.42), fontsize=10,
            arrowprops=dict(arrowstyle='-', color=GREY, lw=0.8))
through_origin(ax)
ax.set_xticks([-np.pi, np.pi], ['-π', 'π']); ax.set_yticks([-1, 1]); ax.set_ylim(-1.5, 1.6)
save(fig, 'gibbs-phenomenon')

# 11. Torus colored by Gaussian curvature
R0, r0 = 2.0, 0.8
u, v = np.meshgrid(np.linspace(0, 2 * np.pi, 120), np.linspace(0, 2 * np.pi, 60))
X = (R0 + r0 * np.cos(v)) * np.cos(u)
Y = (R0 + r0 * np.cos(v)) * np.sin(u)
Z = r0 * np.sin(v)
K = np.cos(v) / (r0 * (R0 + r0 * np.cos(v)))
norm = colors.TwoSlopeNorm(vcenter=0, vmin=K.min(), vmax=K.max())
cmap = colors.LinearSegmentedColormap.from_list('k', [WARM, '#f1eee8', ACC])
fig = plt.figure(figsize=(8, 3.8))
ax = fig.add_subplot(projection='3d')
ax.set_facecolor(BG)
ax.plot_surface(X, Y, Z, facecolors=cmap(norm(K)), rstride=1, cstride=1, linewidth=0.15,
                edgecolor=(0.2, 0.2, 0.25, 0.25), shade=False)
ax.set_box_aspect((1, 1, 0.35)); ax.view_init(32, -60); ax.axis('off')
fig.text(0.74, 0.66, 'K > 0 on the outside', color=ACC, fontsize=10)
fig.text(0.74, 0.58, 'K < 0 on the inside', color=WARM, fontsize=10)
fig.text(0.74, 0.50, 'K = 0 on the top and\nbottom circles', color=GREY, fontsize=9)
fig.subplots_adjust(left=-0.12, right=0.82, top=1.2, bottom=-0.2)
fig.savefig(OUT + 'torus-curvature.png', dpi=200)
plt.close(fig)

# 12. Square with identified edges, glued into a torus
fig, ax = plt.subplots(figsize=(7.5, 3.3))
ax.set_aspect('equal'); ax.axis('off')


def edge(p, q, col, n):
    ax.plot([p[0], q[0]], [p[1], q[1]], color=col, lw=2)
    for k in range(n):
        m = 0.44 + 0.09 * k
        a_ = (p[0] + (q[0] - p[0]) * m, p[1] + (q[1] - p[1]) * m)
        b_ = (p[0] + (q[0] - p[0]) * (m + 0.06), p[1] + (q[1] - p[1]) * (m + 0.06))
        arrow(ax, a_, b_, color=col, size=14)


ax.add_patch(Rectangle((0, 0), 2, 2, color=ACC, alpha=0.06, lw=0))
edge((0, 0), (2, 0), INK, 1); edge((0, 2), (2, 2), INK, 1)
edge((0, 0), (0, 2), ACC, 2); edge((2, 0), (2, 2), ACC, 2)
ax.text(1, -0.32, 'a', ha='center', fontsize=12); ax.text(1, 2.12, 'a', ha='center', fontsize=12)
ax.text(-0.28, 1, 'b', va='center', fontsize=12, color=ACC); ax.text(2.14, 1, 'b', va='center', fontsize=12, color=ACC)
ax.add_patch(FancyArrowPatch((2.7, 1), (3.6, 1), arrowstyle='-|>', mutation_scale=16, color=GREY, lw=1.2))
ax.text(3.15, 1.15, 'glue', ha='center', fontsize=10, color=GREY)
t = np.linspace(0, 2 * np.pi, 200)
cx = 5.3
ax.plot(cx + 1.3 * np.cos(t), 1 + 0.75 * np.sin(t), color=INK, lw=1.6)
s1 = np.linspace(0.15 * np.pi, 0.85 * np.pi, 50)
ax.plot(cx + 0.55 * np.cos(s1), 1.12 - 0.22 * np.sin(s1), color=INK, lw=1.4)
s2 = np.linspace(1.2 * np.pi, 1.8 * np.pi, 50)
ax.plot(cx + 0.42 * np.cos(s2), 0.98 - 0.15 * np.sin(s2), color=INK, lw=1.4)
ax.plot(cx + 0.95 * np.cos(t), 1 + 0.48 * np.sin(t), color=INK, lw=1.1, ls='--')
ax.text(cx, 0.42, 'a', ha='center', fontsize=11)
th = np.linspace(0, 2 * np.pi, 100)
ax.plot(cx + 1.3 + 0.0 * th - 0.33 + 0.33 * np.cos(th) * 0.5, 1 + 0.36 * np.sin(th), color=ACC, lw=1.1)
ax.text(cx + 1.45, 1.42, 'b', fontsize=11, color=ACC)
ax.set_xlim(-0.5, 6.9); ax.set_ylim(-0.5, 2.4)
save(fig, 'torus-gluing')
print('done')
