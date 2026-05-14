# What is Kubernetes, really? — script

**Scope:** keep this video focused on *how do I keep my container alive and reachable*. Pods, Deployments, StatefulSets, and deeper component internals are deferred to other videos.

**Voice:** conversational. Build tension by adding one problem at a time, then unveil that the solution we keep inventing already has a name.

**Rough length:** ~750 words of narration → ~5 minutes spoken at a relaxed pace.

---

## Scene 1 — The container

**Visual:** A single box labeled `my-app` floating in empty space. No host, no infra.

**Narration:**
> Say you have a container you want to run. For now, let's abstract away *where* it runs — pretend it just lives somewhere, on some machine. It's up. It's serving traffic. Life is good.

→ implemented in `src/videos/k8s-intro/scenes/scene1.tsx`

---

## Scene 2 — The crash

**Visual:** The container flickers, turns red, falls out of frame. Beat of silence.

**Narration:**
> …until it crashes. Maybe a bug, maybe it ran out of memory — doesn't matter. It's gone. And now nothing is serving your traffic.

→ implemented in `src/videos/k8s-intro/scenes/scene2.tsx`

---

## Scene 3 — Restart mechanism

**Visual:** A small gear icon appears above where the container was. It "watches," then re-spawns a fresh container in the same spot. Loop this once or twice to show it's automatic.

**Narration:**
> So the first thing you'd want is something *watching* your container — and the moment it dies, bringing it back up. You don't want to be the one waking up at 3am to restart it.

→ implemented in `src/videos/k8s-intro/scenes/scene3.tsx`

---

## Scene 4 — The host dies

**Visual:** Zoom out. The container is now sitting on a labeled box: "Host A". The whole host goes dark. The little watcher gear dies with it.

**Narration:**
> But what if it's not the container that fails — what if the whole machine it's running on goes down? Power, kernel panic, someone tripped over a cable. Now even your restart mechanism is gone.

→ implemented in `src/videos/k8s-intro/scenes/scene4.tsx`

---

## Scene 5 — Multiple hosts + free scheduling

**Visual:** Two more hosts slide in: Host B, Host C. The dead Host A fades. An arrow shows the container being *placed* onto Host B by some invisible hand.

**Narration:**
> Okay, so let's add more machines. And critically — let's not pin our container to any specific one. We just say "run this thing," and *something* decides which host has room and puts it there. If a host dies, that something just picks another one.

→ implemented in `src/videos/k8s-intro/scenes/scene5.tsx`

---

## Scene 6 — Scaling under load

**Visual:** A flood of little request-arrows slams into the single container. It strains. Then: three identical copies of the container appear, one on each host. The arrows distribute across them.

**Narration:**
> Now what if traffic spikes? One container can only do so much. But hey — we already have three hosts. Why not run three copies of the container, one per host, and split the work?

→ implemented in `src/videos/k8s-intro/scenes/scene6.tsx`

---

## Scene 7 — The routing problem

**Visual:** A confused client on the left holding a request, with three containers on the right. Question marks. Which one does it talk to?

**Narration:**
> Which raises a question: how does a client even *find* these copies? Their IPs change every time they get rescheduled. You don't want callers to care about that.

→ implemented in `src/videos/k8s-intro/scenes/scene7.tsx`

---

## Scene 8 — A stable address with on-host routers

> The real K8s names — *Service*, *kube-proxy* — are deliberately not used here. They get introduced as the reveal moment in Scene 9.

**Visual:** A glowing purple pill labeled "stable address" appears above the three hosts. On each host, a small chevron labeled "router" lights up. The client now talks to the stable address, which fans traffic out to whichever container is alive.

**Narration:**
> So we introduce a stable address — one that always points at whatever copies are currently healthy. And on every host, a little router programs the network so traffic to that address ends up at a live container. The client doesn't know or care which one.

→ implemented in `src/videos/k8s-intro/scenes/scene8.tsx`

---

## Scene 9 — The reveal

**Visual:** Hold on the full system. The stage settles smaller. The title **Kubernetes** lands huge over the center, then settles up to a header position while a glowing frame materializes around everything. Then the friendly labels morph into their real K8s names: "stable address" → "Service" (with a self-aware aside that the name is unfortunate), "router" → "kube-proxy".

**Narration:**
> And… congratulations. You've just re-invented Kubernetes. Everything we just built has a name. That stable address out there? In Kubernetes, it's called a **Service** — yes, the name is unfortunate. And those little routers on every host? Those are **kube-proxy**.

→ implemented in `src/videos/k8s-intro/scenes/scene9.tsx`

---

## Scene 10 — Naming the pieces (worker side)

**Visual:** Zoom into one host. Label it "Worker Node." A new component appears on it: **kubelet**. Show kubelet pulling the container image, starting it, and sending a heartbeat arrow upward off-screen.

**Narration:**
> Each host is a **worker node**. On every worker runs a **kubelet** — it's the thing that actually starts your containers, watches them, and reports their status back up the chain. Next to it, the **kube-proxy** we already met, handling the network.

→ implemented in `src/videos/k8s-intro/scenes/scene10.tsx`

---

## Scene 11 — The control plane

**Visual:** The arrows from kubelet travel up into a new region of the diagram labeled "Control Plane." Four components light up one at a time as named:

1. **kube-apiserver** — central hub, all arrows go through it
2. **etcd** — a small database icon, the apiserver reads/writes here
3. **kube-scheduler** — the "invisible hand" from Scene 5, now revealed
4. **controller-manager** — the "watcher gear" from Scene 3, now revealed (show a couple of generic controllers inside it, labeled simply "controller")

**Narration:**
> All of that reporting flows into the **control plane** — a separate set of nodes whose only job is to run the brain of the cluster.
>
> At the center is the **kube-apiserver** — every component talks through it, nothing talks directly to anything else.
>
> Behind it, **etcd** — a key-value store that holds the entire desired state of the cluster. If etcd remembers "I want three copies of this container running," then etcd is the source of truth.
>
> The **kube-scheduler** is the invisible hand from earlier — when a new container needs a home, it picks which worker node has room.
>
> And the **controller-manager** runs all those little watchers we kept inventing — one controller notices a container died and asks for a replacement; another notices a whole node went silent and reschedules its workloads elsewhere. Dozens of these, each watching one kind of thing and nudging reality back toward what etcd says it should be.

→ implemented in `src/videos/k8s-intro/scenes/scene11.tsx`

---

## Scene 12 — Closing

**Visual:** Final wide shot: control plane on top, worker nodes on bottom, arrows flowing. Then collapse the whole diagram back into a single cube labeled "Kubernetes."

**Narration:**
> That's it — at least from far away. Kubernetes isn't magic; it's just the obvious set of things you'd build if you started with one container and kept asking "okay, but what if *that* breaks?"
>
> We named the pieces today, but we glossed over a lot — how the apiserver actually talks to etcd, what really happens inside the scheduler when it picks a node, how a controller goes from "I noticed something" to "I changed something." Plenty to dig into. We'll go deeper in the next ones.

→ implemented in `src/videos/k8s-intro/scenes/scene12.tsx`

---

## Implementation status

| Script scene | Motion Canvas file | Status |
|---|---|---|
| 1. The container | `src/videos/k8s-intro/scenes/scene1.tsx` | ✅ done |
| 2. The crash | `src/videos/k8s-intro/scenes/scene2.tsx` | ✅ done |
| 3. Restart mechanism | `src/videos/k8s-intro/scenes/scene3.tsx` | ✅ done |
| 4. The host dies | `src/videos/k8s-intro/scenes/scene4.tsx` | ✅ done |
| 5. Multiple hosts | `src/videos/k8s-intro/scenes/scene5.tsx` | ✅ done |
| 6. Scaling | `src/videos/k8s-intro/scenes/scene6.tsx` | ✅ done |
| 7. Routing problem | `src/videos/k8s-intro/scenes/scene7.tsx` | ✅ done |
| 8. kube-proxy + Service | `src/videos/k8s-intro/scenes/scene8.tsx` | ✅ done |
| 9. The reveal | `src/videos/k8s-intro/scenes/scene9.tsx` | ✅ done |
| 10. Worker side | `src/videos/k8s-intro/scenes/scene10.tsx` | ✅ done |
| 11. Control plane | `src/videos/k8s-intro/scenes/scene11.tsx` | ✅ done |
| 12. Closing | `src/videos/k8s-intro/scenes/scene12.tsx` | ✅ done |
